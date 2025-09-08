-- DropForeignKey
ALTER TABLE "public"."family_members" DROP CONSTRAINT "family_members_familyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."invites" DROP CONSTRAINT "invites_familyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_memberId_fkey";

-- AddForeignKey
ALTER TABLE "public"."family_members" ADD CONSTRAINT "family_members_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."family_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invites" ADD CONSTRAINT "invites_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;
