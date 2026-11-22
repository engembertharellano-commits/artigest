export interface PreciosSugeridos {
  precioLocal: number | null;
  precioInt: number | null;
  notasLimpias: string;
}

export function parsePreciosDeNotas(notas: string | null | undefined): PreciosSugeridos {
  if (!notas) {
    return { precioLocal: null, precioInt: null, notasLimpias: "" };
  }

  const regex = /\[Cotización:\s*Local\s*\$(\d+(?:\.\d+)?)\s*USD\s*\|\s*Int\s*\$(\d+(?:\.\d+)?)\s*USD\]/i;
  const match = notas.match(regex);

  if (match) {
    const precioLocal = parseFloat(match[1]);
    const precioInt = parseFloat(match[2]);
    const notasLimpias = notas.replace(match[0], "").trim();
    return { precioLocal, precioInt, notasLimpias };
  }

  return { precioLocal: null, precioInt: null, notasLimpias: notas };
}

export function formatNotasConPrecios(
  precioLocal: number,
  precioInt: number,
  notasExistentes: string | null | undefined
): string {
  const { notasLimpias } = parsePreciosDeNotas(notasExistentes);
  const bloqueCotizacion = `[Cotización: Local $${precioLocal} USD | Int $${precioInt} USD]`;

  if (notasLimpias) {
    return `${bloqueCotizacion} ${notasLimpias}`;
  }
  return bloqueCotizacion;
}
