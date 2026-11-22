import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categorias = await prisma.categoriaMaterial.findMany({
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: { materiales: true },
        },
      },
    });
    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías de materiales:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las categorías" },
      { status: 500 }
    );
  }
}
