import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tecnicas = await prisma.tecnica.findMany({
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: { obras: true },
        },
      },
    });
    return NextResponse.json(tecnicas);
  } catch (error) {
    console.error("Error al obtener técnicas:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las técnicas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre } = body;

    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return NextResponse.json(
        { error: "El nombre de la técnica es obligatorio" },
        { status: 400 }
      );
    }

    const nueva = await prisma.tecnica.create({
      data: { nombre: nombre.trim() },
    });

    return NextResponse.json(nueva, { status: 201 });
  } catch (error) {
    console.error("Error al crear técnica:", error);
    return NextResponse.json(
      { error: "Error al crear la técnica (quizá ya existe)" },
      { status: 500 }
    );
  }
}
