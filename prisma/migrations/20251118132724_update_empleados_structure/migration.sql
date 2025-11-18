/*
  Warnings:

  - You are about to drop the column `numero_empleado` on the `empleados` table. All the data in the column will be lost.
  - You are about to alter the column `nombre` on the `empleados` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(150)`.
  - Added the required column `apellido` to the `empleados` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `empleados` DROP COLUMN `numero_empleado`,
    ADD COLUMN `apellido` VARCHAR(150) NOT NULL,
    ADD COLUMN `numero_id` VARCHAR(10) NULL,
    MODIFY `nombre` VARCHAR(150) NOT NULL;
