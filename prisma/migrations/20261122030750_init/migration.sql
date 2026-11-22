-- CreateTable
CREATE TABLE "Configuracion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "nombreProyecto" TEXT NOT NULL DEFAULT 'L''Art d''Avril',
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "simboloMoneda" TEXT NOT NULL DEFAULT '$'
);

-- CreateTable
CREATE TABLE "Tecnica" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Obra" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "tecnicaId" INTEGER NOT NULL,
    "anchoCm" REAL,
    "altoCm" REAL,
    "fechaInicio" DATETIME,
    "fechaFin" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'En proceso',
    "descripcion" TEXT,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Obra_tecnicaId_fkey" FOREIGN KEY ("tecnicaId") REFERENCES "Tecnica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CategoriaMaterial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "unidad" TEXT NOT NULL DEFAULT 'unidad',
    "stockActual" REAL NOT NULL DEFAULT 0,
    "stockMinimo" REAL NOT NULL DEFAULT 0,
    "costoUnitario" REAL NOT NULL DEFAULT 0,
    "proveedor" TEXT,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Material_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaMaterial" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialUsado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "obraId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "cantidad" REAL NOT NULL,
    "costoUnitarioSnapshot" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MaterialUsado_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaterialUsado_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MovimientoMaterial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "materialId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" REAL NOT NULL,
    "motivo" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MovimientoMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GastoOperativo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "concepto" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'General',
    "monto" REAL NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "obraId" INTEGER NOT NULL,
    "precioVenta" REAL NOT NULL,
    "fechaVenta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprador" TEXT,
    "comisionGaleria" REAL NOT NULL DEFAULT 0,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Venta_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tecnica_nombre_key" ON "Tecnica"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaMaterial_nombre_key" ON "CategoriaMaterial"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Venta_obraId_key" ON "Venta"("obraId");
