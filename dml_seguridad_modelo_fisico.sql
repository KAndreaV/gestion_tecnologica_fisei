/* =========================================================
   VALIDACION DE PRIMARY KEY
   ========================================================= */

INSERT INTO departamento (
    id_dep,
    nom_dep
)
VALUES (
    1,
    'REPETIDO'
);

-- Valida:
-- pk_departamento


/* =========================================================
   VALIDACION DE FOREIGN KEY
   ========================================================= */

INSERT INTO usuario (
    nom_usr,
    ape_usr,
    cor_usr,
    tel_usr,
    usu_login,
    pass_hash,
    est_usr,
    id_rol
)
VALUES (
    'Carlos',
    'Prueba',
    'carlos_prueba@uta.edu.ec',
    '0991111111',
    'cprueba_fk',
    '123',
    1,
    999
);

-- Valida:
-- fk_usuario_rol


/* =========================================================
   VALIDACION DE UNIQUE
   ========================================================= */

INSERT INTO usuario (
    nom_usr,
    ape_usr,
    cor_usr,
    tel_usr,
    usu_login,
    pass_hash,
    est_usr,
    id_rol
)
VALUES (
    'Pedro',
    'Lopez',
    'juan.perez@uta.edu.ec',
    '0999999999',
    'pedro',
    '123',
    1,
    1
);

-- Valida:
-- uq_usuario_correo


/* =========================================================
   VALIDACION DE NOT NULL
   ========================================================= */

INSERT INTO rol (
    des_rol,
    est_rol
)
VALUES (
    'Rol sin nombre',
    1
);

-- Valida:
-- nom_rol NOT NULL


/* =========================================================
   VALIDACION DE CHECK FECHA
   ========================================================= */

INSERT INTO prestamo (
    fec_pres,
    fec_devolucion,
    est_pres,
    id_usr,
    id_est
)
VALUES (
    DATE '2026-05-10',
    DATE '2026-05-01',
    1,
    1,
    4
);

-- Valida:
-- fec_devolucion >= fec_pres


/* =========================================================
   VALIDACION DE CHECK CANTIDAD
   ========================================================= */

INSERT INTO articulo (
    nom_art,
    des_art,
    ser_art,
    mar_art,
    mod_art,
    can_art,
    val_art,
    est_art,
    id_cat,
    id_est
)
VALUES (
    'Equipo Error',
    'Prueba CHECK',
    'SER-ERROR',
    'Dell',
    'XPS',
    -5,
    100,
    1,
    1,
    2
);

-- Valida:
-- can_art >= 0


/* =========================================================
   VALIDACION DE INTEGRIDAD REFERENCIAL EN DELETE
   ========================================================= */

DELETE FROM rol
WHERE id_rol = 1;

-- Valida:
-- Oracle no permite borrar registros padre con hijos relacionados.


/* =========================================================
   CREACION DE ROL
   ========================================================= */

CREATE ROLE rol_gestionfisei;


/* =========================================================
   GRANT DE PERMISOS
   ========================================================= */

GRANT CREATE SESSION TO rol_gestionfisei;
GRANT CREATE TABLE TO rol_gestionfisei;
GRANT CREATE VIEW TO rol_gestionfisei;


/* =========================================================
   ASIGNACION DE ROL
   ========================================================= */

GRANT rol_gestionfisei TO GESTIONFISEI_BD;


/* =========================================================
   VALIDACION DE ROL
   ========================================================= */

SELECT *
FROM dba_role_privs
WHERE grantee = 'GESTIONFISEI_BD';


/* =========================================================
   APLICACION DE PERMISOS ADECUADOS PARA EL SISTEMA
   ========================================================= */

GRANT CREATE SESSION TO GESTIONFISEI_BD;
GRANT CREATE TABLE TO GESTIONFISEI_BD;
GRANT CREATE VIEW TO GESTIONFISEI_BD;
GRANT CREATE SEQUENCE TO GESTIONFISEI_BD;
GRANT CREATE TRIGGER TO GESTIONFISEI_BD;
GRANT CREATE PROCEDURE TO GESTIONFISEI_BD;


/* =========================================================
   VALIDACION DE PERMISOS
   ========================================================= */

SELECT *
FROM dba_sys_privs
WHERE grantee = 'GESTIONFISEI_BD';


/* =========================================================
   PRUEBA DE SEGURIDAD
   ========================================================= */

REVOKE CREATE VIEW FROM GESTIONFISEI_BD;

CREATE VIEW prueba_permiso AS
SELECT *
FROM usuario;


/* =========================================================
   ALTER TABLE
   ========================================================= */

ALTER TABLE usuario
ADD CONSTRAINT ck_usuario_correo
CHECK (cor_usr LIKE '%@uta.edu.ec');


ALTER TABLE articulo
ADD stock_min NUMBER DEFAULT 1;


ALTER TABLE articulo
ADD CONSTRAINT ck_articulo_stock_min
CHECK (stock_min >= 0);


ALTER TABLE usuario
ADD CONSTRAINT uq_usuario_telefono
UNIQUE (tel_usr);


/* =========================================================
   VALIDAR INTEGRIDAD REFERENCIAL
   ========================================================= */

INSERT INTO usuario (
    nom_usr,
    ape_usr,
    cor_usr,
    tel_usr,
    usu_login,
    pass_hash,
    est_usr,
    id_rol
)
VALUES (
    'Carlos',
    'Perez',
    'juan.perez@uta.edu.ec',
    '0977777777',
    'cperez',
    '123',
    1,
    1
);


INSERT INTO usuario (
    nom_usr,
    ape_usr,
    cor_usr,
    tel_usr,
    usu_login,
    pass_hash,
    est_usr,
    id_rol
)
VALUES (
    'Mario',
    'Test',
    'mario@uta.edu.ec',
    '0966666666',
    'mtest',
    '123',
    1,
    999
);


INSERT INTO rol (
    des_rol,
    est_rol
)
VALUES (
    'Rol sin nombre',
    1
);


INSERT INTO articulo (
    nom_art,
    des_art,
    ser_art,
    mar_art,
    mod_art,
    can_art,
    val_art,
    est_art,
    id_cat,
    id_est
)
VALUES (
    'Equipo Error',
    'Prueba',
    'SER-999',
    'Dell',
    'XPS',
    -5,
    100,
    1,
    1,
    2
);


DELETE FROM rol
WHERE id_rol = 1;