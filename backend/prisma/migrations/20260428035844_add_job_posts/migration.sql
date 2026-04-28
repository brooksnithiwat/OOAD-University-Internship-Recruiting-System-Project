-- CreateEnum
CREATE TYPE "JobPostStatus" AS ENUM ('ACTIVE', 'CLOSED', 'DRAFT');

-- CreateTable
CREATE TABLE "job_posts" (
    "job_id" TEXT NOT NULL,
    "employer_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "min_gpa" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "duration_weeks" INTEGER NOT NULL,
    "application_deadline" DATE NOT NULL,
    "status" "JobPostStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_posts_pkey" PRIMARY KEY ("job_id")
);

-- CreateTable
CREATE TABLE "job_post_skills" (
    "job_id" TEXT NOT NULL,
    "skill" TEXT NOT NULL,

    CONSTRAINT "job_post_skills_pkey" PRIMARY KEY ("job_id","skill")
);

-- AddForeignKey
ALTER TABLE "job_posts" ADD CONSTRAINT "job_posts_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("employer_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_post_skills" ADD CONSTRAINT "job_post_skills_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job_posts"("job_id") ON DELETE CASCADE ON UPDATE CASCADE;
