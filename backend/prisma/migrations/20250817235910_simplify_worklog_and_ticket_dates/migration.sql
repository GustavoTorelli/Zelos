/*
  Warnings:

  - You are about to drop the `report` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `report` DROP FOREIGN KEY `report_technician_id_fkey`;

-- DropForeignKey
ALTER TABLE `report` DROP FOREIGN KEY `report_ticket_id_fkey`;

-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `duration_seconds` INTEGER NULL,
    ADD COLUMN `started_at` DATETIME(3) NULL;

-- DropTable
DROP TABLE `report`;

-- CreateTable
CREATE TABLE `worklog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `technician_id` INTEGER NOT NULL,
    `ticket_id` INTEGER NOT NULL,

    UNIQUE INDEX `worklog_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `worklog` ADD CONSTRAINT `worklog_technician_id_fkey` FOREIGN KEY (`technician_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worklog` ADD CONSTRAINT `worklog_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
