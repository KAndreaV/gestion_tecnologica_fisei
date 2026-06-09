

SET DEFINE OFF;

SET LINESIZE 200
SET PAGESIZE 100

COLUMN ID_ART FORMAT 999
COLUMN NOM_ART FORMAT A30
COLUMN SER_ART FORMAT A15
COLUMN MAR_ART FORMAT A15
COLUMN MOD_ART FORMAT A20
COLUMN CAN_ART FORMAT 999
COLUMN VAL_ART FORMAT 99999.99

SELECT 
    ID_ART,
    NOM_ART,
    SER_ART,
    MAR_ART,
    MOD_ART,
    CAN_ART,
    VAL_ART
FROM ARTICULO;
-- ---------------------------------------------------------
-- Usuario de esquema y permisos
-- ---------------------------------------------------------

-- Ejecutar como SYS, SYSTEM o un usuario con privilegios de administración.
-- Ajusta el tablespace si tu entorno usa otro nombre distinto de USERS.



CREATE USER gestionfisei1 IDENTIFIED BY gestionfisei1
  DEFAULT TABLESPACE USERS
  TEMPORARY TABLESPACE TEMP
  QUOTA UNLIMITED ON USERS;

GRANT CREATE SESSION TO gestionfisei;
GRANT CREATE TABLE TO gestionfisei;
GRANT CREATE SEQUENCE TO gestionfisei;
GRANT CREATE VIEW TO gestionfisei;
GRANT CREATE TRIGGER TO gestionfisei;
GRANT CREATE PROCEDURE TO gestionfisei;
GRANT CREATE SYNONYM TO gestionfisei;

-- ---------------------------------------------------------
-- Catálogos base
-- ---------------------------------------------------------


CREATE TABLE departamento (
  id_dep        NUMBER,
  nom_dep       VARCHAR2(120) NOT NULL,
  des_dep       VARCHAR2(300),
  fec_registro  DATE DEFAULT SYSDATE NOT NULL,
  CONSTRAINT pk_departamento PRIMARY KEY (id_dep),
  CONSTRAINT uq_departamento_nom UNIQUE (nom_dep),
  CONSTRAINT ck_departamento_nom CHECK (TRIM(nom_dep) IS NOT NULL)
);

CREATE TABLE ubicacion (
  id_ubi        NUMBER,
  nom_ubi       VARCHAR2(120) NOT NULL,
  des_ubi       VARCHAR2(300),
  id_dep        NUMBER NOT NULL,
  fec_registro  DATE DEFAULT SYSDATE NOT NULL,
  CONSTRAINT pk_ubicacion PRIMARY KEY (id_ubi),
  CONSTRAINT uq_ubicacion_nom_dep UNIQUE (nom_ubi, id_dep),
  CONSTRAINT ck_ubicacion_nom CHECK (TRIM(nom_ubi) IS NOT NULL),
  CONSTRAINT fk_ubicacion_departamento FOREIGN KEY (id_dep)
    REFERENCES departamento (id_dep)
);

CREATE TABLE rol (
  id_rol        NUMBER,
  nom_rol       VARCHAR2(80) NOT NULL,
  des_rol       VARCHAR2(300),
  est_rol       NUMBER(1) DEFAULT 1 NOT NULL,
  fec_registro  DATE DEFAULT SYSDATE NOT NULL,
  CONSTRAINT pk_rol PRIMARY KEY (id_rol),
  CONSTRAINT uq_rol_nom UNIQUE (nom_rol),
  CONSTRAINT ck_rol_estado CHECK (est_rol IN (0, 1))
);

CREATE TABLE categoria (
  id_cat        NUMBER,
  nom_cat       VARCHAR2(120) NOT NULL,
  des_cat       VARCHAR2(300),
  fec_registro  DATE DEFAULT SYSDATE NOT NULL,
  CONSTRAINT pk_categoria PRIMARY KEY (id_cat),
  CONSTRAINT uq_categoria_nom UNIQUE (nom_cat),
  CONSTRAINT ck_categoria_nom CHECK (TRIM(nom_cat) IS NOT NULL)
);

CREATE TABLE estado (
  id_est        NUMBER,
  nom_est       VARCHAR2(80) NOT NULL,
  des_est       VARCHAR2(300),
  tipo_est      VARCHAR2(40) NOT NULL,
  fec_registro  DATE DEFAULT SYSDATE NOT NULL,
  CONSTRAINT pk_estado PRIMARY KEY (id_est),
  CONSTRAINT uq_estado_nom_tipo UNIQUE (nom_est, tipo_est),
  CONSTRAINT ck_estado_tipo CHECK (
    tipo_est IN ('ACTIVO', 'ARTICULO', 'PRESTAMO', 'MOVIMIENTO', 'MANTENIMIENTO', 'NOTIFICACION')
  )
);

-- ---------------------------------------------------------
-- Seguridad / usuarios
-- ---------------------------------------------------------

CREATE TABLE usuario (
  id_usr        NUMBER,
  nom_usr       VARCHAR2(120) NOT NULL,
  ape_usr       VARCHAR2(120) NOT NULL,
  cor_usr       VARCHAR2(180) NOT NULL,
  tel_usr       VARCHAR2(30),
  usu_login     VARCHAR2(80) NOT NULL,
  pass_hash     VARCHAR2(255) NOT NULL,
  est_usr       NUMBER(1) DEFAULT 1 NOT NULL,
  id_rol        NUMBER NOT NULL,
  id_dep        NUMBER,
  id_ubi        NUMBER,
  fec_registro  DATE DEFAULT SYSDATE NOT NULL,
  CONSTRAINT pk_usuario PRIMARY KEY (id_usr),
  CONSTRAINT uq_usuario_correo UNIQUE (cor_usr),
  CONSTRAINT uq_usuario_login UNIQUE (usu_login),
  CONSTRAINT ck_usuario_estado CHECK (est_usr IN (0, 1)),
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol)
    REFERENCES rol (id_rol),
  CONSTRAINT fk_usuario_departamento FOREIGN KEY (id_dep)
    REFERENCES departamento (id_dep),
  CONSTRAINT fk_usuario_ubicacion FOREIGN KEY (id_ubi)
    REFERENCES ubicacion (id_ubi)
);

-- ---------------------------------------------------------
-- Inventario
-- ---------------------------------------------------------

CREATE TABLE articulo (
  id_art        NUMBER,
  nom_art       VARCHAR2(180) NOT NULL,
  des_art       VARCHAR2(500),
  ser_art       VARCHAR2(100),
  mar_art       VARCHAR2(80),
  mod_art       VARCHAR2(80),
  can_art       NUMBER DEFAULT 1 NOT NULL,
  val_art       NUMBER(12,2) DEFAULT 0 NOT NULL,
  est_art       NUMBER(1) DEFAULT 1 NOT NULL,
  id_cat        NUMBER NOT NULL,
  id_est        NUMBER NOT NULL,
  id_dep        NUMBER,
  id_ubi        NUMBER,
  fec_registro  DATE DEFAULT SYSDATE NOT NULL,
  CONSTRAINT pk_articulo PRIMARY KEY (id_art),
  CONSTRAINT uq_articulo_serial UNIQUE (ser_art),
  CONSTRAINT ck_articulo_cantidad CHECK (can_art >= 0),
  CONSTRAINT ck_articulo_valor CHECK (val_art >= 0),
  CONSTRAINT ck_articulo_estado CHECK (est_art IN (0, 1)),
  CONSTRAINT fk_articulo_categoria FOREIGN KEY (id_cat)
    REFERENCES categoria (id_cat),
  CONSTRAINT fk_articulo_estado FOREIGN KEY (id_est)
    REFERENCES estado (id_est),
  CONSTRAINT fk_articulo_departamento FOREIGN KEY (id_dep)
    REFERENCES departamento (id_dep),
  CONSTRAINT fk_articulo_ubicacion FOREIGN KEY (id_ubi)
    REFERENCES ubicacion (id_ubi)
);

-- ---------------------------------------------------------
-- Prestamos
-- ---------------------------------------------------------

CREATE TABLE prestamo (
  id_pres       NUMBER,
  fec_pres      DATE DEFAULT SYSDATE NOT NULL,
  fec_entrega   DATE,
  fec_devolucion DATE,
  obs_pres      VARCHAR2(500),
  est_pres      NUMBER(1) DEFAULT 1 NOT NULL,
  id_usr        NUMBER NOT NULL,
  id_est        NUMBER NOT NULL,
  CONSTRAINT pk_prestamo PRIMARY KEY (id_pres),
  CONSTRAINT ck_prestamo_estado CHECK (est_pres IN (0, 1)),
  CONSTRAINT ck_prestamo_fechas CHECK (fec_devolucion IS NULL OR fec_devolucion >= fec_pres),
  CONSTRAINT fk_prestamo_usuario FOREIGN KEY (id_usr)
    REFERENCES usuario (id_usr),
  CONSTRAINT fk_prestamo_estado FOREIGN KEY (id_est)
    REFERENCES estado (id_est)
);

CREATE TABLE detalle_prestamo (
  id_pres      NUMBER NOT NULL,
  id_art       NUMBER NOT NULL,
  can_pre      NUMBER DEFAULT 1 NOT NULL,
  CONSTRAINT pk_detalle_prestamo PRIMARY KEY (id_pres, id_art),
  CONSTRAINT ck_detalle_prestamo_cantidad CHECK (can_pre > 0),
  CONSTRAINT fk_detalle_prestamo_prestamo FOREIGN KEY (id_pres)
    REFERENCES prestamo (id_pres)
    ON DELETE CASCADE,
  CONSTRAINT fk_detalle_prestamo_articulo FOREIGN KEY (id_art)
    REFERENCES articulo (id_art)
);

-- ---------------------------------------------------------
-- Movimientos, mantenimiento, notificaciones y auditoría
-- ---------------------------------------------------------

CREATE TABLE movimiento (
  id_mov        NUMBER,
  tip_mov       VARCHAR2(40) NOT NULL,
  fec_mov       DATE DEFAULT SYSDATE NOT NULL,
  obs_mov       VARCHAR2(500),
  id_art        NUMBER NOT NULL,
  id_usr        NUMBER NOT NULL,
  id_ubi_ori    NUMBER,
  id_ubi_des    NUMBER,
  CONSTRAINT pk_movimiento PRIMARY KEY (id_mov),
  CONSTRAINT ck_movimiento_tipo CHECK (tip_mov IN ('INGRESO', 'SALIDA', 'TRASLADO', 'BAJA', 'AJUSTE', 'PRESTAMO')),
  CONSTRAINT fk_movimiento_articulo FOREIGN KEY (id_art)
    REFERENCES articulo (id_art),
  CONSTRAINT fk_movimiento_usuario FOREIGN KEY (id_usr)
    REFERENCES usuario (id_usr),
  CONSTRAINT fk_movimiento_ubi_ori FOREIGN KEY (id_ubi_ori)
    REFERENCES ubicacion (id_ubi),
  CONSTRAINT fk_movimiento_ubi_des FOREIGN KEY (id_ubi_des)
    REFERENCES ubicacion (id_ubi),
  CONSTRAINT ck_movimiento_origen_destino CHECK (id_ubi_ori IS NULL OR id_ubi_des IS NULL OR id_ubi_ori <> id_ubi_des)
);

CREATE TABLE mantenimiento (
  id_man        NUMBER,
  des_man       VARCHAR2(300) NOT NULL,
  tip_man       VARCHAR2(60) NOT NULL,
  fec_ini       DATE DEFAULT SYSDATE NOT NULL,
  fec_fin       DATE,
  obs_man       VARCHAR2(500),
  est_man       NUMBER(1) DEFAULT 1 NOT NULL,
  id_art        NUMBER NOT NULL,
  id_usr        NUMBER NOT NULL,
  id_est        NUMBER NOT NULL,
  CONSTRAINT pk_mantenimiento PRIMARY KEY (id_man),
  CONSTRAINT ck_mantenimiento_estado CHECK (est_man IN (0, 1)),
  CONSTRAINT ck_mantenimiento_fechas CHECK (fec_fin IS NULL OR fec_fin >= fec_ini),
  CONSTRAINT fk_mantenimiento_articulo FOREIGN KEY (id_art)
    REFERENCES articulo (id_art),
  CONSTRAINT fk_mantenimiento_usuario FOREIGN KEY (id_usr)
    REFERENCES usuario (id_usr),
  CONSTRAINT fk_mantenimiento_estado FOREIGN KEY (id_est)
    REFERENCES estado (id_est)
);

CREATE TABLE notificacion (
  id_not        NUMBER,
  tit_not       VARCHAR2(120) NOT NULL,
  men_not       VARCHAR2(1000) NOT NULL,
  fec_not       DATE DEFAULT SYSDATE NOT NULL,
  est_not       NUMBER(1) DEFAULT 1 NOT NULL,
  id_usr        NUMBER NOT NULL,
  CONSTRAINT pk_notificacion PRIMARY KEY (id_not),
  CONSTRAINT ck_notificacion_estado CHECK (est_not IN (0, 1)),
  CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usr)
    REFERENCES usuario (id_usr)
    ON DELETE CASCADE
);

CREATE TABLE auditoria (
  id_aud        NUMBER,
  nom_tabla     VARCHAR2(80) NOT NULL,
  id_registro   VARCHAR2(80),
  nom_accion    VARCHAR2(20) NOT NULL,
  nom_usuario   VARCHAR2(80) NOT NULL,
  fec_aud       DATE DEFAULT SYSDATE NOT NULL,
  des_aud       VARCHAR2(1000),
  CONSTRAINT pk_auditoria PRIMARY KEY (id_aud),
  CONSTRAINT ck_auditoria_accion CHECK (nom_accion IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE SEQUENCE SEQ_ARTICULO
START WITH 4
INCREMENT BY 1
NOCACHE
NOCYCLE;
