-- =========================================================
-- Pruebas SQL para Oracle - Gestion Tecnologica FISEI
-- Ejecutar solo despues de crear las tablas.
-- Nota: como aun no usaras triggers, los ID se insertan manualmente.
-- =========================================================

ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD';

-- ---------------------------------------------------------
-- Datos base
-- ---------------------------------------------------------

INSERT INTO departamento (id_dep, nom_dep, des_dep) VALUES (1, 'SISTEMAS', 'Departamento de sistemas y soporte');
INSERT INTO departamento (id_dep, nom_dep, des_dep) VALUES (2, 'ELECTRONICA', 'Departamento de electrónica');

INSERT INTO ubicacion (id_ubi, nom_ubi, des_ubi, id_dep) VALUES (1, 'LABORATORIO 1', 'Laboratorio principal', 1);
INSERT INTO ubicacion (id_ubi, nom_ubi, des_ubi, id_dep) VALUES (2, 'LABORATORIO 2', 'Laboratorio secundario', 1);

INSERT INTO rol (id_rol, nom_rol, des_rol, est_rol) VALUES (1, 'ADMINISTRADOR', 'Acceso total', 1);
INSERT INTO rol (id_rol, nom_rol, des_rol, est_rol) VALUES (2, 'DOCENTE', 'Gestión de préstamos y consulta', 1);
INSERT INTO rol (id_rol, nom_rol, des_rol, est_rol) VALUES (3, 'ESTUDIANTE', 'Consulta y solicitud', 1);

INSERT INTO categoria (id_cat, nom_cat, des_cat) VALUES (1, 'COMPUTO', 'Equipos de cómputo');
INSERT INTO categoria (id_cat, nom_cat, des_cat) VALUES (2, 'REDES', 'Equipos de red y conectividad');

INSERT INTO estado (id_est, nom_est, des_est, tipo_est) VALUES (1, 'ACTIVO', 'Registro habilitado', 'ACTIVO');
INSERT INTO estado (id_est, nom_est, des_est, tipo_est) VALUES (2, 'DISPONIBLE', 'Equipo disponible', 'ARTICULO');
INSERT INTO estado (id_est, nom_est, des_est, tipo_est) VALUES (3, 'PRESTADO', 'Equipo prestado', 'ARTICULO');
INSERT INTO estado (id_est, nom_est, des_est, tipo_est) VALUES (4, 'PENDIENTE', 'Préstamo pendiente', 'PRESTAMO');
INSERT INTO estado (id_est, nom_est, des_est, tipo_est) VALUES (5, 'EN_MANTENIMIENTO', 'Equipo en mantenimiento', 'MANTENIMIENTO');
INSERT INTO estado (id_est, nom_est, des_est, tipo_est) VALUES (6, 'ENVIADA', 'Notificación enviada', 'NOTIFICACION');
INSERT INTO estado (id_est, nom_est, des_est, tipo_est) VALUES (7, 'SALIDA', 'Movimiento de salida', 'MOVIMIENTO');

INSERT INTO usuario (
  id_usr, nom_usr, ape_usr, cor_usr, tel_usr, usu_login, pass_hash, est_usr, id_rol, id_dep, id_ubi
) VALUES (
  1, 'Juan', 'Perez', 'juan.perez@uta.edu.ec', '0999999999', 'jperez', 'hash_demo_1', 1, 1, 1, 1
);

INSERT INTO usuario (
  id_usr, nom_usr, ape_usr, cor_usr, tel_usr, usu_login, pass_hash, est_usr, id_rol, id_dep, id_ubi
) VALUES (
  2, 'Maria', 'Lopez', 'maria.lopez@uta.edu.ec', '0988888888', 'mlopez', 'hash_demo_2', 1, 2, 1, 2
);

INSERT INTO articulo (
  id_art, nom_art, des_art, ser_art, mar_art, mod_art, can_art, val_art, est_art, id_cat, id_est, id_dep, id_ubi
) VALUES (
  1, 'Laptop Dell', 'Equipo portátil para laboratorio', 'SER-001', 'Dell', 'Latitude', 5, 850.00, 1, 1, 2, 1, 1
);

INSERT INTO articulo (
  id_art, nom_art, des_art, ser_art, mar_art, mod_art, can_art, val_art, est_art, id_cat, id_est, id_dep, id_ubi
) VALUES (
  2, 'Router TP-Link', 'Equipo de red', 'SER-002', 'TP-Link', 'AX3000', 2, 120.00, 1, 2, 2, 1, 2
);

INSERT INTO prestamo (
  id_pres, fec_pres, fec_entrega, fec_devolucion, obs_pres, est_pres, id_usr, id_est
) VALUES (
  1, DATE '2026-05-05', DATE '2026-05-05', NULL, 'Préstamo de prueba', 1, 2, 4
);

INSERT INTO detalle_prestamo (id_pre, id_art, can_pre) VALUES (1, 1, 1);

INSERT INTO movimiento (
  id_mov, tip_mov, fec_mov, obs_mov, id_art, id_usr, id_ubi_ori, id_ubi_des
) VALUES (
  1, 'TRASLADO', DATE '2026-05-05', 'Cambio de laboratorio', 1, 1, 1, 2
);

INSERT INTO mantenimiento (
  id_man, des_man, tip_man, fec_ini, fec_fin, obs_man, est_man, id_art, id_usr, id_est
) VALUES (
  1, 'Revision preventiva', 'PREVENTIVO', DATE '2026-05-05', NULL, 'Sin novedades', 1, 2, 1, 5
);

INSERT INTO notificacion (
  id_not, tit_not, men_not, fec_not, est_not, id_usr
) VALUES (
  1, 'Prestamo registrado', 'El prestamo fue registrado correctamente', DATE '2026-05-05', 1, 2
);

INSERT INTO auditoria (
  id_aud, nom_tabla, id_registro, nom_accion, nom_usuario, fec_aud, des_aud
) VALUES (
  1, 'prestamo', '1', 'INSERT', 'gestionfisei', DATE '2026-05-05', 'Alta de prestamo de prueba'
);

COMMIT;

-- ---------------------------------------------------------
-- Consultas de verificacion
-- ---------------------------------------------------------

SELECT * FROM departamento;
SELECT * FROM ubicacion;
SELECT * FROM rol;
SELECT * FROM categoria;
SELECT * FROM estado;
SELECT * FROM usuario;
SELECT * FROM articulo;
SELECT * FROM prestamo;
SELECT * FROM detalle_prestamo;
SELECT * FROM movimiento;
SELECT * FROM mantenimiento;
SELECT * FROM notificacion;
SELECT * FROM auditoria;

SELECT * FROM vw_articulo_disponible;
SELECT * FROM vw_usuario_seguridad;

SELECT COUNT(*) AS total_departamentos FROM departamento;
SELECT COUNT(*) AS total_usuarios FROM usuario;
SELECT COUNT(*) AS total_articulos FROM articulo;
