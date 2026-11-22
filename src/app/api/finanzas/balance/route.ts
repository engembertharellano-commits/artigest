import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [ventas, todosLosGastos] = await Promise.all([
      prisma.venta.findMany({
        include: {
          obra: {
            include: { tecnica: true },
          },
        },
        orderBy: { fechaVenta: "desc" },
      }),
      prisma.gastoOperativo.findMany({
        orderBy: { fecha: "desc" },
      }),
    ]);

    const totalVentas = ventas.reduce((acc, v) => acc + v.precioVenta, 0);

    const gastosTaller = todosLosGastos.filter(
      (g) => g.categoria !== "Retiro de Ganancia"
    );
    const retirosGanancia = todosLosGastos.filter(
      (g) => g.categoria === "Retiro de Ganancia"
    );

    const totalGastosTaller = gastosTaller.reduce((acc, g) => acc + g.monto, 0);
    const totalRetirosGanancia = retirosGanancia.reduce((acc, r) => acc + r.monto, 0);

    // El fondo de trabajo real disponible en caja
    const fondoTrabajoDisponible = Number(
      (totalVentas - totalGastosTaller - totalRetirosGanancia).toFixed(2)
    );

    return NextResponse.json({
      totalVentas,
      totalGastosTaller,
      totalRetirosGanancia,
      fondoTrabajoDisponible,
      ventasRecientes: ventas.slice(0, 10),
      gastosRecientes: gastosTaller.slice(0, 10),
      retirosRecientes: retirosGanancia.slice(0, 10),
    });
  } catch (error) {
    console.error("Error al calcular balance:", error);
    return NextResponse.json(
      { error: "No se pudo obtener el balance" },
      { status: 500 }
    );
  }
}
