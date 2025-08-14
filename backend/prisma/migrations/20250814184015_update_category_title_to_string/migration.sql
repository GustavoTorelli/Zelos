/*
  Warnings:

  - You are about to alter the column `title` on the `category` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.
  - The values [awaiting_approval] on the enum `ticket_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `category` MODIFY `title` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `report` ALTER COLUMN `started_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `ticket` MODIFY `status` ENUM('pending', 'in_progress', 'completed') NOT NULL DEFAULT 'pending';
