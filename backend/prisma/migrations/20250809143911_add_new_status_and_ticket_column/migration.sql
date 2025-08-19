-- AlterTable
ALTER TABLE `report` ALTER COLUMN `started_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `closed_at` DATETIME(3) NULL,
    MODIFY `status` ENUM('pending', 'in_progress', 'awaiting_approval', 'completed') NOT NULL DEFAULT 'pending';
