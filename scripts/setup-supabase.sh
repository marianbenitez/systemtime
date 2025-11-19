#!/bin/bash

# Script de configuración de Supabase
# Este script te ayuda a configurar la conexión con Supabase

echo "🚀 Configuración de Supabase para Sistema de Control de Asistencia"
echo "=================================================================="
echo ""

# Verificar que .env existe
if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado. Creando desde .env.example..."
    cp .env.example .env
    echo "✅ Archivo .env creado"
fi

echo "📝 Para obtener tus credenciales de Supabase:"
echo "   1. Ve a https://supabase.com/dashboard"
echo "   2. Selecciona tu proyecto"
echo "   3. Ve a Settings > Database"
echo "   4. Copia las Connection Strings"
echo ""

echo "🔑 Ingresa tus credenciales de Supabase:"
echo ""

# Solicitar URL de pooler (Transaction Mode - puerto 6543)
read -p "📊 DATABASE_URL (Transaction Pooler - puerto 6543): " DATABASE_URL

# Solicitar URL directa (Session Mode - puerto 5432)
read -p "🔌 DIRECT_URL (Direct Connection - puerto 5432): " DIRECT_URL

# Generar NEXTAUTH_SECRET si no existe
if grep -q "your-secret-key-here-change-in-production" .env; then
    echo ""
    echo "🔐 Generando NEXTAUTH_SECRET..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "✅ NEXTAUTH_SECRET generado: $NEXTAUTH_SECRET"
else
    echo "✅ NEXTAUTH_SECRET ya está configurado"
fi

# Actualizar .env
echo ""
echo "💾 Actualizando archivo .env..."

cat > .env << EOF
# Database Configuration - Supabase PostgreSQL
# Connection Pooling (Transaction Mode) - para la aplicación
DATABASE_URL="$DATABASE_URL"

# Direct Connection (Session Mode) - para migraciones
DIRECT_URL="$DIRECT_URL"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

# Application
NODE_ENV="development"
EOF

echo "✅ Archivo .env actualizado correctamente"
echo ""
echo "🎯 Próximos pasos:"
echo "   1. Generar cliente Prisma:    npx prisma generate"
echo "   2. Aplicar migraciones:       npx prisma migrate dev"
echo "   3. Ejecutar seed:             npx tsx prisma/seed.ts"
echo "   4. Iniciar desarrollo:        npm run dev"
echo ""
echo "✨ ¡Configuración completada!"
