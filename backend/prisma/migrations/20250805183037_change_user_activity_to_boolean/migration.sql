/*
  Warnings:

  - You are about to alter the column `is_active` on the `category` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `TinyInt`.
  - You are about to alter the column `is_active` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `category` MODIFY `is_active` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `user` MODIFY `is_active` BOOLEAN NOT NULL DEFAULT true;
