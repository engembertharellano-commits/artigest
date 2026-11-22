import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const materialId = parseInt(id, 10);

    const movimientos = await prisma.movimientoMaterial.findMany({
      where: { materialId },
      orderBy: { fecha: "desc" },
      take: 20,
    });

    return NextResponse.json(movimientos);
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los movimientos" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const materialId = parseInt(id, 10);
    const body = await request.json();
    const { tipo, cantidad, motivo, nuevoCostoUnitario, registrarComoGasto } = body;

    const cant = parseFloat(cantidad);
    if (!cant || cant <= 0) {
      return NextResponse.json(
        { error: "La cantidad debe ser mayor a 0" },
        { status: 400 }
      );
    }

    if (!tipo || !["entrada", "salida"].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo de movimiento no válido ('entrada' o 'salida')" },
        { status: 400 }
      );
    }

    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material no encontrado" },
        { status: 404 }
      );
    }

    // Calcular nuevo stock
    let nuevoStock = material.stockActual;
    if (tipo === "entrada") {
      nuevoStock += cant;
    } else {
      nuevoStock = Math.max(0, material.stockActual - cant);
    }
    nuevoStock = Number(nuevoStock.toFixed(2));

    // Preparar actualización de material
    const dataUpdate: any = { stockActual: nuevoStock };
    if (nuevoCostoUnitario !== undefined && nuevoCostoUnitario !== null && nuevoCostoUnitario !== "") {
      dataUpdate.costoUnitario = parseFloat(nuevoCostoUnitario);
    }

    // Ejecutar en transacción
    const [movimiento, materialActualizado] = await prisma.$transaction([
      prisma.movimientoMaterial.create({
        data: {
          materialId,
          tipo,
          cantidad: cant,
          motivo: motivo?.trim() || (tipo === "entrada" ? "Reposición / Compra" : "Consumo en taller"),
        },
      }),
      prisma.material.update({
        where: { id: materialId },
        data: dataUpdate,
        include: { categoria: true },
      }),
    ]);

    // Si el usuario marcó registrar como gasto operativo en finanzas
    if (tipo === "entrada" && registrarComoGasto) {
      const costoGasto = dataUpdate.costoUnitario || material.costoUnitario;
      const montoGasto = Number((costoGasto * cant).toFixed(2));
      if (montoGasto > 0) {
        await prisma.gastoOperativo.create({
          data: {
            concepto: `Compra de insumo: ${material.nombre} (${cant} ${material.unidad})`,
            categoria: "Herramientas",
            monto: montoGasto,
            notas: `Movimiento automático #${movimiento.id}. Proveedor: ${material.proveedor || "No especificado"}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      movimiento,
      material: materialActualizado,
    });
  } catch (error) {
    console.error("Error al registrar movimiento:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el movimiento" },
      { status: 500 }
    );
  }
}
