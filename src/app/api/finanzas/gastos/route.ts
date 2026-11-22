import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const gastos = await prisma.gastoOperativo.findMany({
      where: {
        categoria: { not: "Retiro de Ganancia" },
      },
      orderBy: { fecha: "desc" },
    });
    return NextResponse.json(gastos);
  } catch (error) {
    console.error("Error al obtener gastos:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los gastos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { concepto, categoria, monto, notas } = body;

    if (!concepto || !concepto.trim()) {
      return NextResponse.json(
        { error: "El concepto del gasto es obligatorio" },
        { status: 400 }
      );
    }

    const valMonto = parseFloat(monto);
    if (!valMonto || valMonto <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser mayor a 0" },
        { status: 400 }
      );
    }

    const nuevoGasto = await prisma.gastoOperativo.create({
      data: {
        concepto: concepto.trim(),
        categoria: categoria || "General",
        monto: valMonto,
        notas: notas?.trim() || null,
      },
    });

    return NextResponse.json(nuevoGasto, { status: 201 });
  } catch (error) {
    console.error("Error al registrar gasto:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el gasto" },
      { status: 500 }
    );
  }
}
