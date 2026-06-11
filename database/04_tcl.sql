-- =============================================================================
-- GESTION TECNOLOGICA FISEI - BASE DE DATOS ORACLE
-- ARCHIVO 04: TCL (TRANSACTION CONTROL LANGUAGE)
-- Gestiona la confirmación, reversión y aislamiento de transacciones de base de datos.
-- =============================================================================

-- 1. Confirmar todos los cambios pendientes de la sesión de carga inicial (DML)
COMMIT;

-- 2. Ejemplo de Transacción de Aislamiento y Bloqueo Seguro (concurrencia de préstamos)
-- SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- LOCK TABLE prestamo IN EXCLUSIVE MODE;

-- 3. Ejemplo de Reversión ante fallo en auditorías
-- ROLLBACK;
