-- DropForeignKey
ALTER TABLE "eligibility_verifications" DROP CONSTRAINT "eligibility_verifications_verified_by_fkey";

-- AddForeignKey
ALTER TABLE "eligibility_verifications" ADD CONSTRAINT "eligibility_verifications_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
