import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const categoriaId = searchParams.get("categoriaId");
    const stockBajo = searchParams.get("stockBajo") === "true";

    const where: any = {};

    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { proveedor: { contains: search } },
        { notas: { contains: search } },
      ];
    }

    if (categoriaId && categoriaId !== "todas") {
      where.categoriaId = parseInt(categoriaId, 10);
    }

    const materiales = await prisma.material.findMany({
      where,
      orderBy: { nombre: "asc" },
      include: {
        categoria: true,
      },
    });

    const resultado = stockBajo
      ? materiales.filter((m) => m.stockActual <= m.stockMinimo)
      : materiales;

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error al obtener materiales:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los materiales" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nombre,
      categoriaId,
      unidad,
      stockActual,
      stockMinimo,
      costoUnitario,
      proveedor,
      notas,
    } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: "El nombre del material es obligatorio" },
        { status: 400 }
      );
    }

    if (!categoriaId) {
      return NextResponse.json(
        { error: "Debes seleccionar una categoría" },
        { status: 400 }
      );
    }

    const nuevo = await prisma.material.create({
      data: {
        nombre: nombre.trim(),
        categoriaId: Number(categoriaId),
        unidad: unidad || "unidad",
        stockActual: stockActual ? parseFloat(stockActual) : 0,
        stockMinimo: stockMinimo ? parseFloat(stockMinimo) : 0,
        costoUnitario: costoUnitario ? parseFloat(costoUnitario) : 0,
        proveedor: proveedor?.trim() || null,
        notas: notas?.trim() || null,
      },
      include: {
        categoria: true,
      },
    });

    return NextResponse.json(nuevo, { status: 201 });
  } catch (error) {
    console.error("Error al crear material:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el material" },
      { status: 500 }
    );
  }
}
