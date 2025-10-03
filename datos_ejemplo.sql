-- =====================================================
-- BASE DE DATOS DE EJEMPLO
-- 5 prácticas de muestra para testing
-- =====================================================

-- Limpiar datos existentes
DELETE FROM GrupoIndicacion;
DELETE FROM PracticaGrupo;
DELETE FROM GruposAlternativos;
DELETE FROM Practica;
DELETE FROM Grupo;
DELETE FROM Indicacion;

-- PRÁCTICAS DE EJEMPLO
INSERT INTO Practica (id_practica, nombre, codigo, activo, fecha_creacion) VALUES 
(69586, 'ACTH', 'ENDO_69586', 1, datetime('now')),
(69424, 'ORINA COMPLETA', 'QUIM_69424', 1, datetime('now')),
(69455, 'UROCULTIVO', 'BACT_69455', 1, datetime('now')),
(69613, 'INSULINA', 'ENDO_69613', 1, datetime('now')),
(70274, 'CORTISOL EN SUERO BASAL', 'ENDO_70274', 1, datetime('now'));

-- GRUPOS DE EJEMPLO
INSERT INTO Grupo (id_grupo, nombre, descripcion, ayuno_horas, orina_horas, orina_tipo, activo, fecha_alta, fecha_ultima_modificacion) VALUES 
(7, 'ENDOCRINO_AYUNO8H', 'Grupo ENDOCRINO - Ayuno 8h', 8, NULL, NULL, 1, datetime('now'), datetime('now')),
(11, 'QUIMICA_PRIMERA_ORINA', 'Grupo QUIMICA - PRIMERA ORINA', NULL, NULL, 'PRIMERA_ORINA', 1, datetime('now'), datetime('now')),
(12, 'BACTERIO_PRIMERA_ORINA', 'Grupo BACTERIO - PRIMERA ORINA', NULL, NULL, 'PRIMERA_ORINA', 1, datetime('now'), datetime('now'));

-- INDICACIONES DE EJEMPLO
INSERT INTO Indicacion (id_indicacion, descripcion, texto_instruccion, tipo_indicacion, area, estado, fecha_alta, fecha_ultima_modificacion) VALUES 
(1, 'Ayuno 8 horas - Estudios endocrinos', 'Concurra al Laboratorio con ayuno de 8 horas, entre las 7:00 y 8:30 hs de la mañana. Evite toda situación de estrés. Informe toda medicación al extraccionista.', 'PREPARACION', 'ENDOCRINO', 'ACTIVO', datetime('now'), datetime('now')),
(2, 'Primera orina - Química', 'Recolecte la primera orina de la mañana en un frasco limpio. Si no puede ser la primera orina, debe tener al menos 3 horas de retención urinaria.', 'PREPARACION', 'QUIMICA', 'ACTIVO', datetime('now'), datetime('now')),
(3, 'Primera orina - Bacteriología', 'Higienizar muy bien los genitales. Recolectar la primera orina de la mañana en frasco estéril. Descartar el primer chorro y recoger la segunda parte.', 'PREPARACION', 'BACTERIO', 'ACTIVO', datetime('now'), datetime('now'));

-- RELACIONES PRACTICA-GRUPO
INSERT INTO PracticaGrupo (id_practica, id_grupo, activo, fecha_vinculacion) VALUES 
(69586, 7, 1, datetime('now')),
(69613, 7, 1, datetime('now')),
(70274, 7, 1, datetime('now')),
(69424, 11, 1, datetime('now')),
(69455, 12, 1, datetime('now'));

-- RELACIONES GRUPO-INDICACION
INSERT INTO GrupoIndicacion (id_grupo, id_indicacion, orden, activo, fecha_vinculacion) VALUES 
(7, 1, 1, 1, datetime('now')),
(11, 2, 1, 1, datetime('now')),
(12, 3, 1, 1, datetime('now'));
