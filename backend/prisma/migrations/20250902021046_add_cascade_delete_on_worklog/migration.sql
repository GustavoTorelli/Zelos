-- DropForeignKey
ALTER TABLE `worklog` DROP FOREIGN KEY `worklog_ticket_id_fkey`;

-- DropIndex
DROP INDEX `worklog_ticket_id_fkey` ON `worklog`;

-- AddForeignKey
ALTER TABLE `worklog` ADD CONSTRAINT `worklog_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
