-- CreateTable
CREATE TABLE "AREA" (
    "id_area" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PRACTICA" (
    "id_practica" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo_did" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "id_area" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" DATETIME NOT NULL,
    CONSTRAINT "PRACTICA_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "AREA" ("id_area") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GRUPO" (
    "id_grupo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "horas_ayuno" INTEGER,
    "tipo_orina" TEXT,
    "horas_orina" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "INDICACION" (
    "id_indicacion" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "texto" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "id_indicacion_prioridad" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" DATETIME NOT NULL,
    CONSTRAINT "INDICACION_id_indicacion_prioridad_fkey" FOREIGN KEY ("id_indicacion_prioridad") REFERENCES "INDICACION" ("id_indicacion") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "PRACTICA_GRUPO" (
    "id_practica" INTEGER NOT NULL,
    "id_grupo" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id_practica", "id_grupo"),
    CONSTRAINT "PRACTICA_GRUPO_id_practica_fkey" FOREIGN KEY ("id_practica") REFERENCES "PRACTICA" ("id_practica") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PRACTICA_GRUPO_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "GRUPO" ("id_grupo") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GRUPO_INDICACION" (
    "id_grupo" INTEGER NOT NULL,
    "id_indicacion" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id_grupo", "id_indicacion"),
    CONSTRAINT "GRUPO_INDICACION_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "GRUPO" ("id_grupo") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GRUPO_INDICACION_id_indicacion_fkey" FOREIGN KEY ("id_indicacion") REFERENCES "INDICACION" ("id_indicacion") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "REGLA_ALTERNATIVA" (
    "id_regla" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_practica_1" INTEGER NOT NULL,
    "id_practica_2" INTEGER NOT NULL,
    "id_grupo_resultado" INTEGER NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" DATETIME NOT NULL,
    CONSTRAINT "REGLA_ALTERNATIVA_id_practica_1_fkey" FOREIGN KEY ("id_practica_1") REFERENCES "PRACTICA" ("id_practica") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "REGLA_ALTERNATIVA_id_practica_2_fkey" FOREIGN KEY ("id_practica_2") REFERENCES "PRACTICA" ("id_practica") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "REGLA_ALTERNATIVA_id_grupo_resultado_fkey" FOREIGN KEY ("id_grupo_resultado") REFERENCES "GRUPO" ("id_grupo") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AREA_nombre_key" ON "AREA"("nombre");

-- CreateIndex
CREATE INDEX "AREA_activo_idx" ON "AREA"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "PRACTICA_codigo_did_key" ON "PRACTICA"("codigo_did");

-- CreateIndex
CREATE INDEX "PRACTICA_codigo_did_idx" ON "PRACTICA"("codigo_did");

-- CreateIndex
CREATE INDEX "PRACTICA_activo_idx" ON "PRACTICA"("activo");

-- CreateIndex
CREATE INDEX "PRACTICA_id_area_idx" ON "PRACTICA"("id_area");

-- CreateIndex
CREATE INDEX "GRUPO_activo_idx" ON "GRUPO"("activo");

-- CreateIndex
CREATE INDEX "GRUPO_horas_ayuno_idx" ON "GRUPO"("horas_ayuno");

-- CreateIndex
CREATE INDEX "GRUPO_tipo_orina_idx" ON "GRUPO"("tipo_orina");

-- CreateIndex
CREATE INDEX "INDICACION_tipo_idx" ON "INDICACION"("tipo");

-- CreateIndex
CREATE INDEX "INDICACION_activo_idx" ON "INDICACION"("activo");

-- CreateIndex
CREATE INDEX "PRACTICA_GRUPO_id_practica_idx" ON "PRACTICA_GRUPO"("id_practica");

-- CreateIndex
CREATE INDEX "PRACTICA_GRUPO_id_grupo_idx" ON "PRACTICA_GRUPO"("id_grupo");

-- CreateIndex
CREATE INDEX "PRACTICA_GRUPO_activo_idx" ON "PRACTICA_GRUPO"("activo");

-- CreateIndex
CREATE INDEX "GRUPO_INDICACION_id_grupo_idx" ON "GRUPO_INDICACION"("id_grupo");

-- CreateIndex
CREATE INDEX "GRUPO_INDICACION_id_indicacion_idx" ON "GRUPO_INDICACION"("id_indicacion");

-- CreateIndex
CREATE INDEX "GRUPO_INDICACION_activo_idx" ON "GRUPO_INDICACION"("activo");

-- CreateIndex
CREATE INDEX "REGLA_ALTERNATIVA_activo_idx" ON "REGLA_ALTERNATIVA"("activo");

-- CreateIndex
CREATE INDEX "REGLA_ALTERNATIVA_id_practica_1_idx" ON "REGLA_ALTERNATIVA"("id_practica_1");

-- CreateIndex
CREATE INDEX "REGLA_ALTERNATIVA_id_practica_2_idx" ON "REGLA_ALTERNATIVA"("id_practica_2");

-- CreateIndex
CREATE INDEX "REGLA_ALTERNATIVA_id_grupo_resultado_idx" ON "REGLA_ALTERNATIVA"("id_grupo_resultado");

-- CreateIndex
CREATE UNIQUE INDEX "REGLA_ALTERNATIVA_id_practica_1_id_practica_2_key" ON "REGLA_ALTERNATIVA"("id_practica_1", "id_practica_2");
