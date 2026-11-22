import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando carga de datos iniciales para L'Art d'Avril...");

  // 1. Configuración
  await prisma.configuracion.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombreProyecto: "L'Art d'Avril",
      moneda: "USD",
      simboloMoneda: "$",
    },
  });

  // 2. Técnicas
  const tecnicasNombres = [
    "Acrílico",
    "Carboncillo",
    "Óleo",
    "Acuarela",
    "Técnica mixta",
    "Escultura",
  ];

  const tecnicasMap: Record<string, number> = {};
  for (const nombre of tecnicasNombres) {
    const t = await prisma.tecnica.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    tecnicasMap[nombre] = t.id;
  }

  // 3. Categorías de materiales
  const categoriasNombres = [
    "Soportes y Lienzos",
    "Pigmentos y Pinturas",
    "Pinceles y Herramientas",
    "Solventes y Barnices",
    "Embalaje y Protección",
  ];

  const categoriasMap: Record<string, number> = {};
  for (const nombre of categoriasNombres) {
    const c = await prisma.categoriaMaterial.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    categoriasMap[nombre] = c.id;
  }

  // 4. Materiales e Insumos diferenciados
  const materialesSeed = [
    {
      nombre: "Lienzo 100x120 cm",
      categoriaId: categoriasMap["Soportes y Lienzos"],
      unidad: "unidad",
      stockActual: 1,
      stockMinimo: 1,
      costoUnitario: 17.0,
      proveedor: "MOTARRO",
      notas:
        "[Soporte: 100x120 cm | Material: Algodón preparado | Perfil: 2 cm] Almacenamiento en lugar seguro",
    },
    {
      nombre: "Lienzo de lino profesional 100x120 cm",
      categoriaId: categoriasMap["Soportes y Lienzos"],
      unidad: "unidad",
      stockActual: 4,
      stockMinimo: 2,
      costoUnitario: 42.0,
      proveedor: "Bellas Artes Import",
      notas:
        "[Soporte: 100x120 cm | Material: Lino Belga | Perfil: 4 cm] Grano medio, imprimación universal",
    },
    {
      nombre: "Papel Arches Grano Fino 300g 56x76 cm",
      categoriaId: categoriasMap["Soportes y Lienzos"],
      unidad: "unidad",
      stockActual: 12,
      stockMinimo: 4,
      costoUnitario: 9.5,
      proveedor: "Arches France",
      notas: "[Soporte: 56x76 cm | Material: Papel Arches 300g | Perfil: 0 cm]",
    },
    {
      nombre: "Estuche de Pinceles Variados (Set 12 uds)",
      categoriaId: categoriasMap["Pinceles y Herramientas"],
      unidad: "estuche",
      stockActual: 1,
      stockMinimo: 1,
      costoUnitario: 26.5,
      proveedor: "Pebeo / Bellas Artes",
      notas:
        "[Herramienta: Set de 12 piezas | Cerda: Sintética dorada Toray] Incluye redondos #0, #2, #6, planos #4, #8, lengua de gato #6 y abanico",
    },
    {
      nombre: "Caja Carboncillos Nitram Academia (5 uds)",
      categoriaId: categoriasMap["Pinceles y Herramientas"],
      unidad: "unidad",
      stockActual: 6,
      stockMinimo: 2,
      costoUnitario: 14.0,
      proveedor: "Nitram Charcoal",
      notas: null,
    },
    {
      nombre: "Tubo Acrílico Golden Heavy Body 150ml (Azul Ultramar)",
      categoriaId: categoriasMap["Pigmentos y Pinturas"],
      unidad: "unidad",
      stockActual: 7,
      stockMinimo: 3,
      costoUnitario: 18.5,
      proveedor: "Golden Artist Colors",
      notas: null,
    },
    {
      nombre: "Tubo Acrílico Titanio Blanco 250ml",
      categoriaId: categoriasMap["Pigmentos y Pinturas"],
      unidad: "unidad",
      stockActual: 4,
      stockMinimo: 2,
      costoUnitario: 22.0,
      proveedor: "Golden Artist Colors",
      notas: null,
    },
    {
      nombre: "Barniz protector UV Satinado 500ml",
      categoriaId: categoriasMap["Solventes y Barnices"],
      unidad: "ml",
      stockActual: 500,
      stockMinimo: 150,
      costoUnitario: 0.05,
      proveedor: "Liquitex",
      notas: null,
    },
  ];

  for (const m of materialesSeed) {
    const exists = await prisma.material.findFirst({
      where: { nombre: m.nombre },
    });
    if (!exists) {
      await prisma.material.create({ data: m });
    }
  }

  // 5. Obras de Avril con cotización dual
  const obrasSeed = [
    {
      titulo: "El Peso del Mundo",
      tecnicaId: tecnicasMap["Acrílico"],
      anchoCm: 100,
      altoCm: 120,
      estado: "Disponible",
      descripcion:
        "Surrealismo cósmico. Un astronauta suspendido sostiene una Tierra incandescente ante la inmensidad del silencio espacial.",
      notas:
        "[Cotización: Local $220 USD | Int $1320 USD] Obra principal de la colección actual. Bastidor reforzado de 4 cm.",
    },
    {
      titulo: "El Tigre",
      tecnicaId: tecnicasMap["Carboncillo"],
      anchoCm: 50,
      altoCm: 70,
      estado: "Disponible",
      descripcion:
        "Fuerza salvaje y mirada penetrante trabajada con técnica de claroscuro profundo y difuminado manual.",
      notas:
        "[Cotización: Local $110 USD | Int $630 USD] Fijado con laca protectora mate especial para carboncillo.",
    },
    {
      titulo: "Atardecer Tropical",
      tecnicaId: tecnicasMap["Acrílico"],
      anchoCm: 80,
      altoCm: 100,
      estado: "En proceso",
      descripcion:
        "Composición marina de horizontes vibrantes, contrastes turquesa y destellos dorados en el rompimiento de olas.",
      notas:
        "[Cotización: Local $160 USD | Int $980 USD] Fase de segundas veladuras y texturas con espátula.",
    },
    {
      titulo: "Paz en la Orilla",
      tecnicaId: tecnicasMap["Acuarela"],
      anchoCm: 40,
      altoCm: 50,
      estado: "Disponible",
      descripcion:
        "Aguadas etéreas de botes anclados en marea baja bajo una neblina luminosa matutina.",
      notas:
        "[Cotización: Local $85 USD | Int $420 USD] Papel Arches 300g montado en passepartout libre de ácido.",
    },
  ];

  for (const o of obrasSeed) {
    const exists = await prisma.obra.findFirst({
      where: { titulo: o.titulo },
    });
    if (!exists) {
      await prisma.obra.create({ data: o });
    }
  }

  console.log("¡Datos iniciales cargados con éxito!");
}

main()
  .catch((e) => {
    console.error("Error al ejecutar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
