import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const ventas = await prisma.venta.findMany({
      orderBy: { fechaVenta: "desc" },
      include: {
        obra: {
          include: { tecnica: true },
        },
      },
    });
    return NextResponse.json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las ventas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { obraId, precioVenta, comprador, comisionGaleria, notas } = body;

    if (!obraId) {
      return NextResponse.json(
        { error: "Debes seleccionar la obra vendida" },
        { status: 400 }
      );
    }

    const precio = parseFloat(precioVenta);
    if (!precio || precio <= 0) {
      return NextResponse.json(
        { error: "El precio de venta debe ser mayor a 0" },
        { status: 400 }
      );
    }

    const oid = Number(obraId);

    // Verificar si la obra existe
    const obra = await prisma.obra.findUnique({
      where: { id: oid },
      include: { venta: true },
    });

    if (!obra) {
      return NextResponse.json(
        { error: "Obra no encontrada" },
        { status: 404 }
      );
    }

    if (obra.venta) {
      return NextResponse.json(
        { error: "Esta obra ya tiene una venta registrada" },
        { status: 400 }
      );
    }

    // Transacción: crear venta y actualizar estado de la obra a "Vendida"
    const [nuevaVenta] = await prisma.$transaction([
      prisma.venta.create({
        data: {
          obraId: oid,
          precioVenta: precio,
          comprador: comprador?.trim() || null,
          comisionGaleria: comisionGaleria ? parseFloat(comisionGaleria) : 0,
          notas: notas?.trim() || null,
        },
        include: {
          obra: {
            include: { tecnica: true },
          },
        },
      }),
      prisma.obra.update({
        where: { id: oid },
        data: { estado: "Vendida" },
      }),
    ]);

    return NextResponse.json(nuevaVenta, { status: 201 });
  } catch (error) {
    console.error("Error al registrar venta:", error);
    return NextResponse.json(
      { error: "No se pudo registrar la venta" },
      { status: 500 }
    );
  }
}
