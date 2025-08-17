/*
  Warnings:

  - A unique constraint covering the columns `[reset_token]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `reset_token` VARCHAR(191) NULL,
    ADD COLUMN `reset_token_expires` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_reset_token_key` ON `user`(`reset_token`);
