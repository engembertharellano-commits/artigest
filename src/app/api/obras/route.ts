import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const tecnicaId = searchParams.get("tecnicaId");
    const estado = searchParams.get("estado");

    const where: any = {};

    if (search) {
      where.OR = [
        { titulo: { contains: search } },
        { descripcion: { contains: search } },
      ];
    }

    if (tecnicaId && tecnicaId !== "todas") {
      where.tecnicaId = parseInt(tecnicaId, 10);
    }

    if (estado && estado !== "todos") {
      where.estado = estado;
    }

    const obras = await prisma.obra.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tecnica: true,
        materiales: {
          include: {
            material: true,
          },
        },
        venta: true,
      },
    });

    return NextResponse.json(obras);
  } catch (error) {
    console.error("Error al obtener obras:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las obras" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      titulo,
      tecnicaId,
      anchoCm,
      altoCm,
      estado,
      descripcion,
      notas,
    } = body;

    if (!titulo || !titulo.trim()) {
      return NextResponse.json(
        { error: "El título de la obra es obligatorio" },
        { status: 400 }
      );
    }

    if (!tecnicaId) {
      return NextResponse.json(
        { error: "Debes seleccionar una técnica artística" },
        { status: 400 }
      );
    }

    const obra = await prisma.obra.create({
      data: {
        titulo: titulo.trim(),
        tecnicaId: Number(tecnicaId),
        anchoCm: anchoCm ? parseFloat(anchoCm) : null,
        altoCm: altoCm ? parseFloat(altoCm) : null,
        estado: estado || "Disponible",
        descripcion: descripcion?.trim() || null,
        notas: notas?.trim() || null,
      },
      include: {
        tecnica: true,
      },
    });

    return NextResponse.json(obra, { status: 201 });
  } catch (error) {
    console.error("Error al crear la obra:", error);
    return NextResponse.json(
      { error: "No se pudo registrar la obra" },
      { status: 500 }
    );
  }
}
