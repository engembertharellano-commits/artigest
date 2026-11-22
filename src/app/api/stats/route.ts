import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalObras, obrasDisponibles, totalMateriales, ventas, gastos] =
      await Promise.all([
        prisma.obra.count(),
        prisma.obra.count({ where: { estado: "Disponible" } }),
        prisma.material.count(),
        prisma.venta.findMany({ select: { precioVenta: true } }),
        prisma.gastoOperativo.findMany({ select: { monto: true } }),
      ]);

    const totalIngresos = ventas.reduce((acc, v) => acc + v.precioVenta, 0);
    const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);

    return NextResponse.json({
      totalObras,
      obrasDisponibles,
      totalMateriales,
      totalIngresos,
      totalGastos,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { error: "No se pudieron calcular las estadísticas" },
      { status: 500 }
    );
  }
}
