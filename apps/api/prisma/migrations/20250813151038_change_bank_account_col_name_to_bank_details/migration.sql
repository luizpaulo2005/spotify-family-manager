/*
  Warnings:

  - You are about to drop the column `bankAccount` on the `families` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."families" DROP COLUMN "bankAccount",
ADD COLUMN     "bankDetails" JSONB;
