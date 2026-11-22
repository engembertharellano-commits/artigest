import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const retiros = await prisma.gastoOperativo.findMany({
      where: {
        categoria: "Retiro de Ganancia",
      },
      orderBy: { fecha: "desc" },
    });
    return NextResponse.json(retiros);
  } catch (error) {
    console.error("Error al obtener retiros:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los retiros" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { monto, motivo, notas } = body;

    const valMonto = parseFloat(monto);
    if (!valMonto || valMonto <= 0) {
      return NextResponse.json(
        { error: "El monto del retiro debe ser mayor a 0" },
        { status: 400 }
      );
    }

    const nuevoRetiro = await prisma.gastoOperativo.create({
      data: {
        concepto: motivo?.trim() || "Retiro de Ganancia / Artista",
        categoria: "Retiro de Ganancia",
        monto: valMonto,
        notas: notas?.trim() || null,
      },
    });

    return NextResponse.json(nuevoRetiro, { status: 201 });
  } catch (error) {
    console.error("Error al registrar retiro:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el retiro" },
      { status: 500 }
    );
  }
}
