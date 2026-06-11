-- =============================================================================
-- GESTION TECNOLOGICA FISEI - BASE DE DATOS ORACLE
-- ARCHIVO 03: DCL (DATA CONTROL LANGUAGE)
-- Administra usuarios, roles y asignación de permisos de acceso.
-- =============================================================================

-- Ejecutar como SYS, SYSTEM o un usuario con privilegios DBA.

-- ---------------------------------------------------------
-- 1. Creación del Usuario Principal del Sistema
-- ---------------------------------------------------------
CREATE USER gestionfisei1 IDENTIFIED BY gestionfisei1
  DEFAULT TABLESPACE USERS
  TEMPORARY TABLESPACE TEMP
  QUOTA UNLIMITED ON USERS;

-- ---------------------------------------------------------
-- 2. Concesión de Privilegios al Usuario del Esquema
-- ---------------------------------------------------------
GRANT CREATE SESSION TO gestionfisei1;
GRANT CREATE TABLE TO gestionfisei1;
GRANT CREATE SEQUENCE TO gestionfisei1;
GRANT CREATE VIEW TO gestionfisei1;
GRANT CREATE TRIGGER TO gestionfisei1;
GRANT CREATE PROCEDURE TO gestionfisei1;
GRANT CREATE SYNONYM TO gestionfisei1;

-- ---------------------------------------------------------
-- 3. Creación y Configuración del Rol del Aplicativo
-- ---------------------------------------------------------
CREATE ROLE rol_gestionfisei;

-- Otorgar permisos al Rol
GRANT CREATE SESSION TO rol_gestionfisei;
GRANT CREATE TABLE TO rol_gestionfisei;
GRANT CREATE VIEW TO rol_gestionfisei;

-- Asignar Rol a un usuario de administración de base de datos alternativo
-- (Ajusta GESTIONFISEI_BD por el nombre de tu usuario de servicio si cambia)
-- GRANT rol_gestionfisei TO GESTIONFISEI_BD;
