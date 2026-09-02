/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `page_elements` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `apellido` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `name`,
    DROP COLUMN `profileImage`,
    ADD COLUMN `apellido` VARCHAR(191) NOT NULL,
    ADD COLUMN `curso` VARCHAR(191) NULL,
    ADD COLUMN `division` VARCHAR(191) NULL,
    ADD COLUMN `nombre` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `page_elements`;
