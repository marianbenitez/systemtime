-- Script para limpiar datos del sistema biométrico
-- ADVERTENCIA: Esto eliminará TODOS los datos de marcaciones, asistencias y empleados

SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar informes generados
TRUNCATE TABLE informes;

-- Limpiar resúmenes mensuales
TRUNCATE TABLE resumen_mensual;

-- Limpiar asistencia diaria
TRUNCATE TABLE asistencia_diaria;

-- Limpiar marcaciones raw
TRUNCATE TABLE marcaciones_raw;

-- Limpiar importaciones
TRUNCATE TABLE importaciones;

-- Limpiar empleados
TRUNCATE TABLE empleados;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Tablas limpiadas exitosamente' as resultado;
