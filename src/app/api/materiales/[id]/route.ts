import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const materialId = parseInt(id, 10);

    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        categoria: true,
        movimientos: {
          orderBy: { fecha: "desc" },
          take: 10,
        },
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error("Error al obtener material:", error);
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
    const materialId = parseInt(id, 10);
    const body = await request.json();

    const data: any = {};
    if (body.nombre !== undefined) data.nombre = body.nombre.trim();
    if (body.categoriaId !== undefined) data.categoriaId = Number(body.categoriaId);
    if (body.unidad !== undefined) data.unidad = body.unidad;
    if (body.stockActual !== undefined) data.stockActual = parseFloat(body.stockActual);
    if (body.stockMinimo !== undefined) data.stockMinimo = parseFloat(body.stockMinimo);
    if (body.costoUnitario !== undefined) data.costoUnitario = parseFloat(body.costoUnitario);
    if (body.proveedor !== undefined) data.proveedor = body.proveedor?.trim() || null;
    if (body.notas !== undefined) data.notas = body.notas?.trim() || null;

    const actualizado = await prisma.material.update({
      where: { id: materialId },
      data,
      include: {
        categoria: true,
      },
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("Error al actualizar material:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el material" },
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
    const materialId = parseInt(id, 10);

    await prisma.material.delete({
      where: { id: materialId },
    });

    return NextResponse.json({ success: true, message: "Material eliminado" });
  } catch (error) {
    console.error("Error al eliminar material:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el material" },
      { status: 500 }
    );
  }
}
