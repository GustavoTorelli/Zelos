/*
  Warnings:

  - Added the required column `location` to the `patrimony` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `patrimony` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `patrimony` ADD COLUMN `location` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;
