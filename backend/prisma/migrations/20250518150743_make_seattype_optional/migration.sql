/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `film_halls` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `seats` DROP FOREIGN KEY `seats_seatTypeId_fkey`;

-- AlterTable
ALTER TABLE `seats` MODIFY `seatTypeId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `film_halls_userId_key` ON `film_halls`(`userId`);

-- AddForeignKey
ALTER TABLE `seats` ADD CONSTRAINT `seats_seatTypeId_fkey` FOREIGN KEY (`seatTypeId`) REFERENCES `seat_types`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
