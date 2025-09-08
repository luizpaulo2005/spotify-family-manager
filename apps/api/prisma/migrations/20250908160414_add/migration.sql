/*
  Warnings:

  - The `status` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('pending', 'paid', 'reversed');

-- AlterTable
ALTER TABLE "public"."payments" DROP COLUMN "status",
ADD COLUMN     "status" "public"."PaymentStatus" NOT NULL DEFAULT 'pending';
