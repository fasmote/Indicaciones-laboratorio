-- CreateTable
CREATE TABLE "PRACTICA" (
    "id_practica" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GRUPO" (
    "id_grupo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "ayuno_horas" INTEGER,
    "orina_horas" INTEGER,
    "orina_tipo" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_alta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_baja" DATETIME,
    "fecha_ultima_modificacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "INDICACION" (
    "id_indicacion" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descripcion" TEXT NOT NULL,
    "texto_instruccion" TEXT NOT NULL,
    "tipo_indicacion" TEXT,
    "area" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "id_indicacion_inferior" INTEGER,
    "fecha_alta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_baja" DATETIME,
    "fecha_ultima_modificacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "INDICACION_id_indicacion_inferior_fkey" FOREIGN KEY ("id_indicacion_inferior") REFERENCES "INDICACION" ("id_indicacion") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PRACTICA_GRUPO" (
    "id_practica" INTEGER NOT NULL,
    "id_grupo" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_vinculacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id_practica", "id_grupo"),
    CONSTRAINT "PRACTICA_GRUPO_id_practica_fkey" FOREIGN KEY ("id_practica") REFERENCES "PRACTICA" ("id_practica") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PRACTICA_GRUPO_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "GRUPO" ("id_grupo") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GRUPO_INDICACION" (
    "id_grupo" INTEGER NOT NULL,
    "id_indicacion" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_vinculacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id_grupo", "id_indicacion"),
    CONSTRAINT "GRUPO_INDICACION_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "GRUPO" ("id_grupo") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GRUPO_INDICACION_id_indicacion_fkey" FOREIGN KEY ("id_indicacion") REFERENCES "INDICACION" ("id_indicacion") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GRUPOS_ALTERNATIVOS" (
    "id_grupo_alternativo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_grupo_condicion_1" INTEGER NOT NULL,
    "id_grupo_condicion_2" INTEGER NOT NULL,
    "id_grupo_resultante" INTEGER NOT NULL,
    "descripcion_caso" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GRUPOS_ALTERNATIVOS_id_grupo_condicion_1_fkey" FOREIGN KEY ("id_grupo_condicion_1") REFERENCES "GRUPO" ("id_grupo") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GRUPOS_ALTERNATIVOS_id_grupo_condicion_2_fkey" FOREIGN KEY ("id_grupo_condicion_2") REFERENCES "GRUPO" ("id_grupo") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GRUPOS_ALTERNATIVOS_id_grupo_resultante_fkey" FOREIGN KEY ("id_grupo_resultante") REFERENCES "GRUPO" ("id_grupo") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PRACTICA_codigo_key" ON "PRACTICA"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "GRUPOS_ALTERNATIVOS_id_grupo_condicion_1_id_grupo_condicion_2_key" ON "GRUPOS_ALTERNATIVOS"("id_grupo_condicion_1", "id_grupo_condicion_2");
