/*
  Warnings:

  - You are about to drop the column `dueDate` on the `families` table. All the data in the column will be lost.
  - Added the required column `dueDay` to the `families` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."families" DROP COLUMN "dueDate",
ADD COLUMN     "dueDay" INTEGER NOT NULL;
