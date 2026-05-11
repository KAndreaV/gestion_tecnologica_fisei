-- =========================================================
-- TAREA: CONSULTAS Y SUBCONSULTAS SQL
-- RAMA: feature/consultas-subconsultas-sql
-- =========================================================

-- ---------------------------------------------------------
-- 1. CONSULTAS JOIN
-- Consulta 1 — Inventario completo
-- Obtiene los artículos junto con el nombre de su categoría
-- ---------------------------------------------------------
SELECT 
    a.id_art AS id_articulo, 
    a.nom_art AS nombre_articulo, 
    a.can_art AS cantidad_disponible,
    a.val_art AS precio_unitario, 
    c.nom_cat AS categoria
FROM articulo a
JOIN categoria c ON a.id_cat = c.id_cat;


-- ---------------------------------------------------------
-- 2. CONSULTAS GROUP BY
-- Consulta 2 — Total artículos por categoría
-- Cuenta cuántos tipos de artículos existen por cada categoría
-- ---------------------------------------------------------
SELECT 
    c.id_cat AS id_categoria, 
    c.nom_cat AS nombre_categoria, 
    COUNT(a.id_art) AS total_articulos
FROM articulo a
JOIN categoria c ON a.id_cat = c.id_cat
GROUP BY c.id_cat, c.nom_cat
ORDER BY c.id_cat ASC;


-- ---------------------------------------------------------
-- 3. CONSULTAS ORDER BY
-- Consulta 3 — Artículos más costosos
-- Lista los artículos ordenados de mayor a menor valor
-- ---------------------------------------------------------
SELECT 
    id_art AS id_articulo, 
    nom_art AS nombre_articulo, 
    val_art AS valor_unitario 
FROM articulo 
ORDER BY val_art DESC;


-- ---------------------------------------------------------
-- 4. FUNCIONES AGREGADAS
-- Consulta 4 — Valor total inventario
-- Calcula el valor monetario total multiplicando valor por cantidad
-- ---------------------------------------------------------
SELECT 
    SUM(val_art * can_art) AS valor_total_inventario 
FROM articulo;


-- ---------------------------------------------------------
-- 5. CONSULTAS COMPLEJAS
-- Consulta 5 — Préstamos activos con usuario
-- Usa múltiples JOIN para traer el usuario, artículo, fechas y estado
-- ---------------------------------------------------------
SELECT 
    p.id_pres AS id_prestamo, 
    u.nom_usr || ' ' || u.ape_usr AS usuario, 
    a.nom_art AS articulo, 
    p.fec_pres AS fecha_prestamo,
    e.nom_est AS estado_prestamo
FROM prestamo p
JOIN usuario u ON p.id_usr = u.id_usr
JOIN detalle_prestamo dp ON p.id_pres = dp.id_pre
JOIN articulo a ON dp.id_art = a.id_art
JOIN estado e ON p.id_est = e.id_est
WHERE e.nom_est = 'PENDIENTE';


-- ---------------------------------------------------------
-- 6. SUBCONSULTAS SIMPLES
-- Consulta 6 — Artículos con valor mayor al promedio
-- Filtra los artículos que cuestan más que la media de todos
-- ---------------------------------------------------------
SELECT 
    id_art AS id_articulo, 
    nom_art AS nombre_articulo, 
    val_art AS precio 
FROM articulo 
WHERE val_art > (SELECT AVG(val_art) FROM articulo);


-- ---------------------------------------------------------
-- 7. SUBCONSULTAS EXISTS
-- Consulta 7 — Usuarios con préstamos
-- Verifica eficientemente qué usuarios han hecho al menos un préstamo
-- ---------------------------------------------------------
SELECT 
    id_usr AS id_usuario,
    nom_usr AS nombre, 
    ape_usr AS apellido 
FROM usuario u
WHERE EXISTS (
    SELECT 1 
    FROM prestamo p 
    WHERE p.id_usr = u.id_usr
);


-- ---------------------------------------------------------
-- 8. SUBCONSULTAS IN
-- Consulta 8 — Artículos prestados
-- Busca artículos cuyo ID se encuentre en el detalle de préstamos
-- ---------------------------------------------------------
SELECT 
    id_art AS id_articulo,
    nom_art AS nombre_articulo,
    ser_art AS numero_serie
FROM articulo 
WHERE id_art IN (SELECT id_art FROM detalle_prestamo);


-- ---------------------------------------------------------
-- 9. SUBCONSULTAS ALL / ANY
-- Consulta 9 — Artículo más costoso
-- Compara el valor del artículo contra TODOS los demás valores
-- ---------------------------------------------------------
SELECT 
    id_art AS id_articulo,
    nom_art AS nombre_articulo, 
    val_art AS precio 
FROM articulo 
WHERE val_art >= ALL (SELECT val_art FROM articulo);


SELECT username FROM all_users WHERE username = 'GESTIONFISEI';