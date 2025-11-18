-- CreateTable
CREATE TABLE `empleados` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_ac` VARCHAR(20) NOT NULL,
    `numero_empleado` VARCHAR(10) NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `departamento` VARCHAR(100) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `empleados_numero_ac_key`(`numero_ac`),
    INDEX `empleados_numero_ac_idx`(`numero_ac`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `importaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_archivo` VARCHAR(255) NOT NULL,
    `tipo_archivo` ENUM('marcaciones', 'invalidos') NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NOT NULL,
    `total_registros` INTEGER NOT NULL,
    `registros_validos` INTEGER NOT NULL,
    `registros_invalidos` INTEGER NOT NULL,
    `usuario` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `importaciones_fecha_inicio_fecha_fin_idx`(`fecha_inicio`, `fecha_fin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marcaciones_raw` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_ac` VARCHAR(20) NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `fecha_hora` DATETIME(3) NOT NULL,
    `estado` ENUM('Entrada', 'Salida') NOT NULL,
    `excepcion` ENUM('FOT', 'Invalido', 'Repetido') NOT NULL DEFAULT 'FOT',
    `nuevo_estado` VARCHAR(50) NULL,
    `operacion` VARCHAR(50) NULL,
    `importacion_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `marcaciones_raw_numero_ac_fecha_hora_idx`(`numero_ac`, `fecha_hora`),
    INDEX `marcaciones_raw_importacion_id_idx`(`importacion_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asistencia_diaria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empleado_id` INTEGER NOT NULL,
    `fecha` DATE NOT NULL,
    `entrada_1` DATETIME(3) NULL,
    `salida_1` DATETIME(3) NULL,
    `entrada_2` DATETIME(3) NULL,
    `salida_2` DATETIME(3) NULL,
    `entrada_3` DATETIME(3) NULL,
    `salida_3` DATETIME(3) NULL,
    `horas_trabajadas` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `tiene_errores` BOOLEAN NOT NULL DEFAULT false,
    `tipo_error` VARCHAR(100) NULL,
    `observaciones` TEXT NULL,
    `marcaciones_raw` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `asistencia_diaria_fecha_idx`(`fecha`),
    INDEX `asistencia_diaria_empleado_id_fecha_idx`(`empleado_id`, `fecha`),
    UNIQUE INDEX `asistencia_diaria_empleado_id_fecha_key`(`empleado_id`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resumen_mensual` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empleado_id` INTEGER NOT NULL,
    `año` INTEGER NOT NULL,
    `mes` INTEGER NOT NULL,
    `dias_trabajados` INTEGER NOT NULL DEFAULT 0,
    `total_horas` DECIMAL(7, 2) NOT NULL DEFAULT 0,
    `dias_con_errores` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `resumen_mensual_año_mes_idx`(`año`, `mes`),
    UNIQUE INDEX `resumen_mensual_empleado_id_año_mes_key`(`empleado_id`, `año`, `mes`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `informes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empleado_id` INTEGER NOT NULL,
    `tipo_informe` ENUM('tolerante', 'estricto') NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NOT NULL,
    `archivo_path` VARCHAR(500) NULL,
    `total_dias_trabajados` INTEGER NULL,
    `total_horas` DECIMAL(7, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `informes_empleado_id_fecha_inicio_fecha_fin_idx`(`empleado_id`, `fecha_inicio`, `fecha_fin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `marcaciones_raw` ADD CONSTRAINT `marcaciones_raw_importacion_id_fkey` FOREIGN KEY (`importacion_id`) REFERENCES `importaciones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asistencia_diaria` ADD CONSTRAINT `asistencia_diaria_empleado_id_fkey` FOREIGN KEY (`empleado_id`) REFERENCES `empleados`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resumen_mensual` ADD CONSTRAINT `resumen_mensual_empleado_id_fkey` FOREIGN KEY (`empleado_id`) REFERENCES `empleados`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `informes` ADD CONSTRAINT `informes_empleado_id_fkey` FOREIGN KEY (`empleado_id`) REFERENCES `empleados`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
