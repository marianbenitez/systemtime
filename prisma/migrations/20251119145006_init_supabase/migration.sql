-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED');

-- CreateEnum
CREATE TYPE "tipo_archivo" AS ENUM ('marcaciones', 'invalidos');

-- CreateEnum
CREATE TYPE "estado_marcacion" AS ENUM ('Entrada', 'Salida');

-- CreateEnum
CREATE TYPE "excepcion_marcacion" AS ENUM ('FOT', 'Invalido', 'Repetido');

-- CreateEnum
CREATE TYPE "tipo_informe" AS ENUM ('tolerante', 'estricto');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "empleados" (
    "id" SERIAL NOT NULL,
    "numero_ac" VARCHAR(20) NOT NULL,
    "numero_id" VARCHAR(10),
    "nombre" VARCHAR(150) NOT NULL,
    "apellido" VARCHAR(150) NOT NULL,
    "departamento" VARCHAR(100),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empleados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "importaciones" (
    "id" SERIAL NOT NULL,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "tipo_archivo" "tipo_archivo" NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "total_registros" INTEGER NOT NULL,
    "registros_validos" INTEGER NOT NULL,
    "registros_invalidos" INTEGER NOT NULL,
    "usuario" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "importaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcaciones_raw" (
    "id" SERIAL NOT NULL,
    "numero_ac" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "estado" "estado_marcacion" NOT NULL,
    "excepcion" "excepcion_marcacion" NOT NULL DEFAULT 'FOT',
    "nuevo_estado" VARCHAR(50),
    "operacion" VARCHAR(50),
    "importacion_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marcaciones_raw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencia_diaria" (
    "id" SERIAL NOT NULL,
    "empleado_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "entrada_1" TIMESTAMP(3),
    "salida_1" TIMESTAMP(3),
    "entrada_2" TIMESTAMP(3),
    "salida_2" TIMESTAMP(3),
    "entrada_3" TIMESTAMP(3),
    "salida_3" TIMESTAMP(3),
    "horas_trabajadas" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tiene_errores" BOOLEAN NOT NULL DEFAULT false,
    "tipo_error" VARCHAR(100),
    "observaciones" TEXT,
    "marcaciones_raw" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asistencia_diaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumen_mensual" (
    "id" SERIAL NOT NULL,
    "empleado_id" INTEGER NOT NULL,
    "año" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "dias_trabajados" INTEGER NOT NULL DEFAULT 0,
    "total_horas" DECIMAL(7,2) NOT NULL DEFAULT 0,
    "dias_con_errores" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumen_mensual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "informes" (
    "id" SERIAL NOT NULL,
    "empleado_id" INTEGER NOT NULL,
    "tipo_informe" "tipo_informe" NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "archivo_path" VARCHAR(500),
    "total_dias_trabajados" INTEGER,
    "total_horas" DECIMAL(7,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "informes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "attendances_userId_idx" ON "attendances"("userId");

-- CreateIndex
CREATE INDEX "attendances_date_idx" ON "attendances"("date");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "empleados_numero_ac_key" ON "empleados"("numero_ac");

-- CreateIndex
CREATE INDEX "empleados_numero_ac_idx" ON "empleados"("numero_ac");

-- CreateIndex
CREATE INDEX "importaciones_fecha_inicio_fecha_fin_idx" ON "importaciones"("fecha_inicio", "fecha_fin");

-- CreateIndex
CREATE INDEX "marcaciones_raw_numero_ac_fecha_hora_idx" ON "marcaciones_raw"("numero_ac", "fecha_hora");

-- CreateIndex
CREATE INDEX "marcaciones_raw_importacion_id_idx" ON "marcaciones_raw"("importacion_id");

-- CreateIndex
CREATE INDEX "asistencia_diaria_fecha_idx" ON "asistencia_diaria"("fecha");

-- CreateIndex
CREATE INDEX "asistencia_diaria_empleado_id_fecha_idx" ON "asistencia_diaria"("empleado_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "asistencia_diaria_empleado_id_fecha_key" ON "asistencia_diaria"("empleado_id", "fecha");

-- CreateIndex
CREATE INDEX "resumen_mensual_año_mes_idx" ON "resumen_mensual"("año", "mes");

-- CreateIndex
CREATE UNIQUE INDEX "resumen_mensual_empleado_id_año_mes_key" ON "resumen_mensual"("empleado_id", "año", "mes");

-- CreateIndex
CREATE INDEX "informes_empleado_id_fecha_inicio_fecha_fin_idx" ON "informes"("empleado_id", "fecha_inicio", "fecha_fin");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marcaciones_raw" ADD CONSTRAINT "marcaciones_raw_importacion_id_fkey" FOREIGN KEY ("importacion_id") REFERENCES "importaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencia_diaria" ADD CONSTRAINT "asistencia_diaria_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumen_mensual" ADD CONSTRAINT "resumen_mensual_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "informes" ADD CONSTRAINT "informes_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
