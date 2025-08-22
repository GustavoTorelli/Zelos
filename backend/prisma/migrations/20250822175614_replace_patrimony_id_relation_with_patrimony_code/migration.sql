/*
  Warnings:

  - You are about to drop the column `patrimony_id` on the `ticket` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ticket` DROP FOREIGN KEY `ticket_patrimony_id_fkey`;

-- DropIndex
DROP INDEX `ticket_patrimony_id_fkey` ON `ticket`;

-- AlterTable
ALTER TABLE `ticket` DROP COLUMN `patrimony_id`,
    ADD COLUMN `patrimony_code` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_patrimony_code_fkey` FOREIGN KEY (`patrimony_code`) REFERENCES `patrimony`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;
