#!/bin/bash

echo "🚀 Iniciando importación dual de archivos Excel..."
echo ""

API_URL="http://localhost:3000/api/marcaciones/importar-dual"
ARCHIVO_SIN_ERRORES="Ac Reg del 01-05 al 31--05.xls"
ARCHIVO_CON_ERRORES="Marcaciones del 01-05 al 31--05 (1).xls"

# Verificar que los archivos existen
if [ ! -f "$ARCHIVO_SIN_ERRORES" ]; then
    echo "❌ Error: No se encontró el archivo SIN ERRORES"
    exit 1
fi

if [ ! -f "$ARCHIVO_CON_ERRORES" ]; then
    echo "❌ Error: No se encontró el archivo CON ERRORES"
    exit 1
fi

echo "✅ Archivos encontrados:"
echo "   - SIN ERRORES: $ARCHIVO_SIN_ERRORES"
echo "   - CON ERRORES: $ARCHIVO_CON_ERRORES"
echo ""

echo "📤 Enviando archivos al servidor..."
echo "   URL: $API_URL"
echo "   Período: 01/05/2025 - 31/05/2025"
echo ""

# Hacer la petición con curl
response=$(curl -s -X POST "$API_URL" \
  -F "archivoSinErrores=@$ARCHIVO_SIN_ERRORES" \
  -F "archivoConErrores=@$ARCHIVO_CON_ERRORES" \
  -F "fechaInicio=2025-05-01" \
  -F "fechaFin=2025-05-31")

# Verificar si hubo error
if echo "$response" | grep -q '"error"'; then
    echo "❌ ERROR EN IMPORTACIÓN:"
    echo "$response" | grep -o '"error":"[^"]*"' | cut -d'"' -f4
    exit 1
fi

# Mostrar resultados
echo "✅ IMPORTACIÓN EXITOSA!"
echo ""
echo "================================================================================"
echo "$response" | grep -o '"mensaje":"[^"]*"' | cut -d'"' -f4
echo "================================================================================"
echo ""

# Extraer estadísticas
total_emp=$(echo "$response" | grep -o '"totalEmpleados":[0-9]*' | cut -d':' -f2)
emp_dep=$(echo "$response" | grep -o '"empleadosConDepartamento":[0-9]*' | cut -d':' -f2)
total_marc=$(echo "$response" | grep -o '"totalMarcaciones":[0-9]*' | cut -d':' -f2)
marc_val=$(echo "$response" | grep -o '"marcacionesValidas":[0-9]*' | cut -d':' -f2)
marc_rep=$(echo "$response" | grep -o '"marcacionesRepetidas":[0-9]*' | cut -d':' -f2)
marc_inv=$(echo "$response" | grep -o '"marcacionesInvalidas":[0-9]*' | cut -d':' -f2)

echo "📊 ESTADÍSTICAS DE LA IMPORTACIÓN:"
echo ""
echo "👥 EMPLEADOS:"
echo "   Total empleados: $total_emp"
echo "   Con departamento: $emp_dep"
echo ""

echo "📋 MARCACIONES:"
echo "   Total marcaciones: $total_marc"
echo "   ✅ Válidas (FOT): $marc_val"
echo "   ⚠️  Repetidas: $marc_rep"
echo "   ❌ Inválidas: $marc_inv"
echo ""

# Calcular porcentajes
porc_val=$(echo "scale=2; $marc_val * 100 / $total_marc" | bc)
porc_rep=$(echo "scale=2; $marc_rep * 100 / $total_marc" | bc)
porc_inv=$(echo "scale=2; $marc_inv * 100 / $total_marc" | bc)

echo "📈 PORCENTAJES:"
echo "   Válidas: $porc_val%"
echo "   Repetidas: $porc_rep%"
echo "   Inválidas: $porc_inv%"
echo ""

echo "================================================================================"
echo ""
echo "🎯 PRÓXIMOS PASOS:"
echo "   1. Revisa los empleados en: http://localhost:3000/dashboard/empleados-biometrico"
echo "   2. Genera informes en: http://localhost:3000/dashboard/informes"
echo ""

echo "💾 DATOS GUARDADOS EN BASE DE DATOS:"
echo "   - empleados: $total_emp registros"
echo "   - importaciones: 1 registro"
echo "   - marcaciones_raw: $total_marc registros"
echo "   - asistencia_diaria: ~$((total_emp * 20)) registros (estimado)"
echo "   - resumen_mensual: $total_emp registros"
echo ""

echo "✅ Importación completada exitosamente!"
