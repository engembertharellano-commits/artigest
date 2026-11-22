import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const obraId = parseInt(id, 10);

    const obra = await prisma.obra.findUnique({
      where: { id: obraId },
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

    if (!obra) {
      return NextResponse.json(
        { error: "Obra no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(obra);
  } catch (error) {
    console.error("Error al obtener detalle de la obra:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const obraId = parseInt(id, 10);
    const body = await request.json();

    const data: any = {};
    if (body.titulo !== undefined) data.titulo = body.titulo.trim();
    if (body.tecnicaId !== undefined) data.tecnicaId = Number(body.tecnicaId);
    if (body.anchoCm !== undefined)
      data.anchoCm = body.anchoCm ? parseFloat(body.anchoCm) : null;
    if (body.altoCm !== undefined)
      data.altoCm = body.altoCm ? parseFloat(body.altoCm) : null;
    if (body.estado !== undefined) data.estado = body.estado;
    if (body.descripcion !== undefined)
      data.descripcion = body.descripcion?.trim() || null;
    if (body.notas !== undefined) data.notas = body.notas?.trim() || null;

    const obraActualizada = await prisma.obra.update({
      where: { id: obraId },
      data,
      include: {
        tecnica: true,
      },
    });

    return NextResponse.json(obraActualizada);
  } catch (error) {
    console.error("Error al actualizar obra:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la obra" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const obraId = parseInt(id, 10);

    await prisma.obra.delete({
      where: { id: obraId },
    });

    return NextResponse.json({ success: true, message: "Obra eliminada" });
  } catch (error) {
    console.error("Error al eliminar obra:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la obra" },
      { status: 500 }
    );
  }
}
