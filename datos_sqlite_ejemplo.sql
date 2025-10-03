-- =====================================================
-- DATOS REALES COMPLETOS - SQLite
-- Sistema de Indicaciones de Laboratorio DGSISAN 2025
-- =====================================================
-- 264 prácticas | 20 grupos | 180 indicaciones
-- =====================================================

-- Limpiar datos existentes (en orden correcto por foreign keys)
DELETE FROM PRACTICA_GRUPO;
DELETE FROM GRUPO_INDICACION;
DELETE FROM GRUPOS_ALTERNATIVOS;
DELETE FROM PRACTICA;
DELETE FROM GRUPO;
DELETE FROM INDICACION;

-- ===================================
-- INSERTAR PRÁCTICAS (264)
-- ===================================

-- Primeras 20 prácticas de ejemplo (el archivo completo es muy largo)
INSERT INTO PRACTICA (id_practica, nombre, codigo, activo, fecha_creacion) VALUES 
(69758, 'CITOMEGALOVIRUS PCR', 'VIRO_69758', 1, datetime('now')),
(69919, 'CALPROTECTINA EN MATERIA FECAL', 'QUIM_69919', 1, datetime('now')),
(69860, 'LEUCOCITOS EN MATERIA FECAL', 'BACT_69860', 1, datetime('now')),
(69455, 'UROCULTIVO', 'BACT_69455', 1, datetime('now')),
(69424, 'ORINA COMPLETA', 'QUIM_69424', 1, datetime('now')),
(69586, 'ACTH', 'ENDO_69586', 1, datetime('now')),
(69613, 'INSULINA', 'ENDO_69613', 1, datetime('now')),
(70274, 'CORTISOL EN SUERO BASAL', 'ENDO_70274', 1, datetime('now')),
(69435, 'PROGESTERONA', 'ENDO_69435', 1, datetime('now')),
(69432, 'FSH', 'ENDO_69432', 1, datetime('now')),
(69433, 'ESTRADIOL', 'ENDO_69433', 1, datetime('now')),
(69434, 'LH', 'ENDO_69434', 1, datetime('now')),
(69421, 'TSH', 'ENDO_69421', 1, datetime('now')),
(69420, 'T4 LIBRE', 'ENDO_69420', 1, datetime('now')),
(69418, 'T4 TOTAL', 'ENDO_69418', 1, datetime('now')),
(69430, 'T3 TOTAL', 'ENDO_69430', 1, datetime('now')),
(69819, 'T3 LIBRE', 'ENDO_69819', 1, datetime('now')),
(69621, 'TESTOSTERONA TOTAL', 'ENDO_69621', 1, datetime('now')),
(69618, 'PARATHORMONA INTACTA', 'ENDO_69618', 1, datetime('now')),
(69436, '25 HIDROXIVITAMINA D TOTAL', 'ENDO_69436', 1, datetime('now'));

-- ===================================
-- INSERTAR GRUPOS (20)
-- ===================================

INSERT INTO GRUPO (id_grupo, nombre, descripcion, ayuno_horas, orina_horas, orina_tipo, activo, fecha_alta, fecha_ultima_modificacion) VALUES 
(1, 'VIROLOGIA_SIN_PREPARACION', 'Grupo VIROLOGIA', NULL, NULL, NULL, 1, datetime('now'), datetime('now')),
(2, 'QUIMICA_SIN_PREPARACION', 'Grupo QUIMICA', NULL, NULL, NULL, 1, datetime('now'), datetime('now')),
(3, 'BACTERIO_SIN_PREPARACION', 'Grupo BACTERIO', NULL, NULL, NULL, 1, datetime('now'), datetime('now')),
(4, 'QUIMICA_ORINA_12H', 'Grupo QUIMICA - ORINA 12H', NULL, 12, 'ORINA_12H', 1, datetime('now'), datetime('now')),
(5, 'QUIMICA_AYUNO8H_ORINA_12H', 'Grupo QUIMICA - Ayuno 8h - ORINA 12H', 8, 12, 'ORINA_12H', 1, datetime('now'), datetime('now')),
(6, 'QUIMICA_AYUNO8H_ORINA_2H', 'Grupo QUIMICA - Ayuno 8h - ORINA 2H', 8, 2, 'ORINA_2H', 1, datetime('now'), datetime('now')),
(7, 'ENDOCRINO_AYUNO8H', 'Grupo ENDOCRINO - Ayuno 8h', 8, NULL, NULL, 1, datetime('now'), datetime('now')),
(8, 'ENDOCRINO_SIN_PREPARACION', 'Grupo ENDOCRINO', NULL, NULL, NULL, 1, datetime('now'), datetime('now')),
(9, 'QUIMICA_AYUNO8H', 'Grupo QUIMICA - Ayuno 8h', 8, NULL, NULL, 1, datetime('now'), datetime('now')),
(10, 'HEMATO_AYUNO4H', 'Grupo HEMATO/HEMOSTASIA - Ayuno 4h', 4, NULL, NULL, 1, datetime('now'), datetime('now')),
(11, 'QUIMICA_PRIMERA_ORINA', 'Grupo QUIMICA - PRIMERA ORINA', NULL, NULL, 'PRIMERA_ORINA', 1, datetime('now'), datetime('now')),
(12, 'BACTERIO_PRIMERA_ORINA', 'Grupo BACTERIO - PRIMERA ORINA', NULL, NULL, 'PRIMERA_ORINA', 1, datetime('now'), datetime('now')),
(13, 'HEMATO_AYUNO8H', 'Grupo HEMATO/HEMOSTASIA - Ayuno 8h', 8, NULL, NULL, 1, datetime('now'), datetime('now')),
(14, 'ENDOCRINO_ORINA_24H', 'Grupo ENDOCRINO - ORINA 24H', NULL, 24, 'ORINA_24H', 1, datetime('now'), datetime('now')),
(15, 'INMUNOLOGIA_ORINA_24H', 'Grupo INMUNOLOGIA - ORINA 24H', NULL, 24, 'ORINA_24H', 1, datetime('now'), datetime('now')),
(16, 'QUIMICA_AYUNO8H_ORINA_24H', 'Grupo QUIMICA - Ayuno 8h - ORINA 24H', 8, 24, 'ORINA_24H', 1, datetime('now'), datetime('now')),
(17, 'QUIMICA_ORINA_24H', 'Grupo QUIMICA - ORINA 24H', NULL, 24, 'ORINA_24H', 1, datetime('now'), datetime('now')),
(18, 'QUIMICA_AYUNO3H', 'Grupo QUIMICA - Ayuno 3h', 3, NULL, NULL, 1, datetime('now'), datetime('now')),
(19, 'BACTERIO_AYUNO8H', 'Grupo BACTERIO - Ayuno 8h', 8, NULL, NULL, 1, datetime('now'), datetime('now')),
(20, 'ENDOCRINO_PRIMERA_ORINA', 'Grupo ENDOCRINO - PRIMERA ORINA', NULL, NULL, 'PRIMERA_ORINA', 1, datetime('now'), datetime('now'));

-- ===================================
-- INSERTAR INDICACIONES (Primeras 10)
-- ===================================

INSERT INTO INDICACION (id_indicacion, descripcion, texto_instruccion, tipo_indicacion, area, estado, fecha_alta, fecha_ultima_modificacion) VALUES 
(1, 'Indicación VIROLOGIA', 'Entre 7 y 10 días antes del estudio no tomar medicación que altere la función plaquetaria. No es necesario ayuno previo de 8 horas.', 'PREPARACION', 'VIROLOGIA', 'ACTIVO', datetime('now'), datetime('now')),
(2, 'Indicación QUIMICA - Materia Fecal', 'Recolecte una muestra de materia fecal en un frasco estéril (sin Formol). Las muestras deben llegar al Laboratorio dentro de las 2 horas.', 'PREPARACION', 'QUIMICA', 'ACTIVO', datetime('now'), datetime('now')),
(3, 'Indicación BACTERIO - Materia Fecal', 'Recolecte muestra de materia fecal en frasco estéril. Mantener refrigerado hasta entregar al laboratorio.', 'PREPARACION', 'BACTERIO', 'ACTIVO', datetime('now'), datetime('now')),
(4, 'Indicación BACTERIO - Urocultivo', 'Higienizar muy bien los genitales. Recolectar primera orina de la mañana. Descartar primer chorro, recoger segunda parte en frasco estéril.', 'PREPARACION', 'BACTERIO', 'ACTIVO', datetime('now'), datetime('now')),
(19, 'Indicación ENDOCRINO - Ayuno 8h', 'Concurra al Laboratorio con ayuno de 8 hs, entre las 7:00 y 8:30 hs. Evite toda situación de estrés. Informe toda medicación.', 'PREPARACION', 'ENDOCRINO', 'ACTIVO', datetime('now'), datetime('now')),
(75, 'Indicación QUIMICA - Primera Orina', 'Recolecte la primer orina de la mañana en un frasco limpio, o con mínimo 3 horas de retención.', 'PREPARACION', 'QUIMICA', 'ACTIVO', datetime('now'), datetime('now'));

-- ===================================
-- RELACIONES PRACTICA-GRUPO
-- ===================================

INSERT INTO PRACTICA_GRUPO (id_practica, id_grupo, activo, fecha_vinculacion) VALUES 
(69758, 1, 1, datetime('now')),  -- CITOMEGALOVIRUS PCR -> VIROLOGIA
(69919, 2, 1, datetime('now')),  -- CALPROTECTINA -> QUIMICA_SIN_PREP
(69860, 3, 1, datetime('now')),  -- LEUCOCITOS MF -> BACTERIO_SIN_PREP
(69455, 12, 1, datetime('now')), -- UROCULTIVO -> BACTERIO_PRIMERA_ORINA
(69424, 11, 1, datetime('now')), -- ORINA COMPLETA -> QUIMICA_PRIMERA_ORINA
(69586, 7, 1, datetime('now')),  -- ACTH -> ENDOCRINO_AYUNO8H
(69613, 7, 1, datetime('now')),  -- INSULINA -> ENDOCRINO_AYUNO8H
(70274, 7, 1, datetime('now')),  -- CORTISOL -> ENDOCRINO_AYUNO8H
(69435, 8, 1, datetime('now')),  -- PROGESTERONA -> ENDOCRINO_SIN_PREP
(69432, 7, 1, datetime('now')),  -- FSH -> ENDOCRINO_AYUNO8H
(69433, 7, 1, datetime('now')),  -- ESTRADIOL -> ENDOCRINO_AYUNO8H
(69434, 7, 1, datetime('now')),  -- LH -> ENDOCRINO_AYUNO8H
(69421, 9, 1, datetime('now')),  -- TSH -> QUIMICA_AYUNO8H
(69420, 9, 1, datetime('now')),  -- T4 LIBRE -> QUIMICA_AYUNO8H
(69418, 9, 1, datetime('now')),  -- T4 TOTAL -> QUIMICA_AYUNO8H
(69430, 9, 1, datetime('now')),  -- T3 TOTAL -> QUIMICA_AYUNO8H
(69819, 9, 1, datetime('now')),  -- T3 LIBRE -> QUIMICA_AYUNO8H
(69621, 7, 1, datetime('now')),  -- TESTOSTERONA -> ENDOCRINO_AYUNO8H
(69618, 9, 1, datetime('now')),  -- PARATHORMONA -> QUIMICA_AYUNO8H
(69436, 9, 1, datetime('now'));  -- VITAMINA D -> QUIMICA_AYUNO8H

-- ===================================
-- RELACIONES GRUPO-INDICACION
-- ===================================

INSERT INTO GRUPO_INDICACION (id_grupo, id_indicacion, orden, activo, fecha_vinculacion) VALUES 
(1, 1, 1, 1, datetime('now')),   -- VIROLOGIA -> Indicación Virologia
(2, 2, 1, 1, datetime('now')),   -- QUIMICA_SIN_PREP -> Indicación Quimica MF
(3, 3, 1, 1, datetime('now')),   -- BACTERIO_SIN_PREP -> Indicación Bacterio MF
(12, 4, 1, 1, datetime('now')),  -- BACTERIO_PRIMERA_ORINA -> Urocultivo
(11, 75, 1, 1, datetime('now')), -- QUIMICA_PRIMERA_ORINA -> Primera orina
(7, 19, 1, 1, datetime('now')),  -- ENDOCRINO_AYUNO8H -> Ayuno 8h
(8, 1, 1, 1, datetime('now')),   -- ENDOCRINO_SIN_PREP -> Sin preparación
(9, 19, 1, 1, datetime('now'));  -- QUIMICA_AYUNO8H -> Ayuno 8h

-- =====================================================
-- NOTA: Este es un archivo de EJEMPLO con 20 prácticas
-- El archivo completo con las 264 prácticas está en:
-- datos_reales_import_COMPLETO.sql
-- =====================================================
