-- DropForeignKey
ALTER TABLE `ticket` DROP FOREIGN KEY `ticket_technician_id_fkey`;

-- DropIndex
DROP INDEX `ticket_technician_id_fkey` ON `ticket`;

-- AlterTable
ALTER TABLE `ticket` MODIFY `technician_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_technician_id_fkey` FOREIGN KEY (`technician_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
