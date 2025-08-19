-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `patrimony_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `patrimony` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `patrimony_id_key`(`id`),
    UNIQUE INDEX `patrimony_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_patrimony_id_fkey` FOREIGN KEY (`patrimony_id`) REFERENCES `patrimony`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
