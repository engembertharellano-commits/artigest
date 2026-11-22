export type TipoRecursoMaterial = "soporte" | "consumible" | "herramienta";

export interface EspecificacionesMaterial {
  tipoRecurso: TipoRecursoMaterial;
  // Soporte físico (Lienzo, bastidor, madera)
  esSoporte: boolean;
  anchoCm: number | null;
  altoCm: number | null;
  tipoMaterial: string | null; // ej: "Lino Belga", "Algodón preparado", "Madera"
  perfilCm: number | null; // ej: 2, 4 (cm)

  // Herramientas y Sets (Estuches de pinceles, espátulas, caballete)
  esHerramienta: boolean;
  esSet: boolean;
  piezasSet: number | null; // ej: 12 (pinceles)
  tipoCerda: string | null; // ej: "Sintética suave", "Cerda de cerdo", "Pelo de marta", "Acero inoxidable"

  // Consumible gradual (Pinturas, barnices, solventes)
  esConsumible: boolean;

  notasLimpias: string;
}

// Tipo de retrocompatibilidad
export type EspecificacionesSoporte = EspecificacionesMaterial;

export function parseEspecificacionesMaterial(
  categoriaNombre: string,
  notas: string | null | undefined
): EspecificacionesMaterial {
  const catLower = (categoriaNombre || "").toLowerCase();
  const esCatSoporte =
    catLower.includes("soporte") ||
    catLower.includes("lienzo") ||
    catLower.includes("bastidor") ||
    catLower.includes("marco");

  const esCatHerramienta =
    catLower.includes("pincel") ||
    catLower.includes("herramienta") ||
    catLower.includes("caballete") ||
    catLower.includes("espátula") ||
    catLower.includes("espatula");

  const tipoPorDefecto: TipoRecursoMaterial = esCatSoporte
    ? "soporte"
    : esCatHerramienta
    ? "herramienta"
    : "consumible";

  if (!notas) {
    return {
      tipoRecurso: tipoPorDefecto,
      esSoporte: tipoPorDefecto === "soporte",
      anchoCm: null,
      altoCm: null,
      tipoMaterial: null,
      perfilCm: null,
      esHerramienta: tipoPorDefecto === "herramienta",
      esSet: false,
      piezasSet: null,
      tipoCerda: null,
      esConsumible: tipoPorDefecto === "consumible",
      notasLimpias: "",
    };
  }

  // 1. Patrón Soporte: [Soporte: 100x120 cm | Material: Lino Belga | Perfil: 4 cm]
  const regexSoporte =
    /\[Soporte:\s*(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)\s*cm(?:\s*\|\s*Material:\s*([^|\]]+))?(?:\s*\|\s*Perfil:\s*(\d+(?:\.\d+)?)\s*cm)?\]/i;
  const matchSoporte = notas.match(regexSoporte);

  if (matchSoporte) {
    const anchoCm = parseFloat(matchSoporte[1]);
    const altoCm = parseFloat(matchSoporte[2]);
    const tipoMaterial = matchSoporte[3] ? matchSoporte[3].trim() : null;
    const perfilCm = matchSoporte[4] ? parseFloat(matchSoporte[4]) : null;
    const notasLimpias = notas.replace(matchSoporte[0], "").trim();

    return {
      tipoRecurso: "soporte",
      esSoporte: true,
      anchoCm,
      altoCm,
      tipoMaterial,
      perfilCm,
      esHerramienta: false,
      esSet: false,
      piezasSet: null,
      tipoCerda: null,
      esConsumible: false,
      notasLimpias,
    };
  }

  // 2. Patrón Herramienta / Estuche: [Herramienta: Set de 12 piezas | Cerda: Sintética dorada] o [Herramienta: Pieza individual | Material: Acero]
  const regexHerramienta =
    /\[Herramienta:\s*(Set de\s*(\d+)\s*piezas|Pieza individual)(?:\s*\|\s*(?:Cerda|Material):\s*([^|\]]+))?\]/i;
  const matchHerramienta = notas.match(regexHerramienta);

  if (matchHerramienta) {
    const esSet = matchHerramienta[1].toLowerCase().includes("set");
    const piezasSet = matchHerramienta[2] ? parseInt(matchHerramienta[2], 10) : null;
    const tipoCerda = matchHerramienta[3] ? matchHerramienta[3].trim() : null;
    const notasLimpias = notas.replace(matchHerramienta[0], "").trim();

    return {
      tipoRecurso: "herramienta",
      esSoporte: false,
      anchoCm: null,
      altoCm: null,
      tipoMaterial: null,
      perfilCm: null,
      esHerramienta: true,
      esSet,
      piezasSet,
      tipoCerda,
      esConsumible: false,
      notasLimpias,
    };
  }

  // 3. Sin etiqueta especial -> según categoría
  return {
    tipoRecurso: tipoPorDefecto,
    esSoporte: tipoPorDefecto === "soporte",
    anchoCm: null,
    altoCm: null,
    tipoMaterial: null,
    perfilCm: null,
    esHerramienta: tipoPorDefecto === "herramienta",
    esSet: false,
    piezasSet: null,
    tipoCerda: null,
    esConsumible: tipoPorDefecto === "consumible",
    notasLimpias: notas,
  };
}

export function formatNotasConSoporte(
  anchoCm: number | string | null,
  altoCm: number | string | null,
  tipoMaterial: string | null,
  perfilCm: number | string | null,
  notasExistentes: string | null | undefined
): string {
  if (!anchoCm || !altoCm) {
    return (notasExistentes || "").trim();
  }

  let bloque = `[Soporte: ${anchoCm}x${altoCm} cm`;
  if (tipoMaterial && tipoMaterial.trim()) {
    bloque += ` | Material: ${tipoMaterial.trim()}`;
  }
  if (perfilCm) {
    bloque += ` | Perfil: ${perfilCm} cm`;
  }
  bloque += `]`;

  const notasLimpias = (notasExistentes || "")
    .replace(/\[Soporte:[^\]]+\]/i, "")
    .replace(/\[Herramienta:[^\]]+\]/i, "")
    .trim();

  if (notasLimpias) {
    return `${bloque} ${notasLimpias}`;
  }
  return bloque;
}

export function formatNotasConHerramienta(
  esSet: boolean,
  piezasSet: number | string | null,
  tipoCerda: string | null,
  notasExistentes: string | null | undefined
): string {
  const piezasNum = piezasSet ? parseInt(String(piezasSet), 10) : null;
  const descripcionPieza = esSet && piezasNum
    ? `Set de ${piezasNum} piezas`
    : "Pieza individual";

  let bloque = `[Herramienta: ${descripcionPieza}`;
  if (tipoCerda && tipoCerda.trim()) {
    bloque += ` | Cerda: ${tipoCerda.trim()}`;
  }
  bloque += `]`;

  const notasLimpias = (notasExistentes || "")
    .replace(/\[Soporte:[^\]]+\]/i, "")
    .replace(/\[Herramienta:[^\]]+\]/i, "")
    .trim();

  if (notasLimpias) {
    return `${bloque} ${notasLimpias}`;
  }
  return bloque;
}
