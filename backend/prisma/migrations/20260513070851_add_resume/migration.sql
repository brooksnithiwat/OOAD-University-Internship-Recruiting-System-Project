-- CreateEnum
CREATE TYPE "VirusScanStatus" AS ENUM ('PENDING', 'CLEAN', 'INFECTED');

-- CreateTable
CREATE TABLE "resumes" (
    "resume_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_ref" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL DEFAULT 'application/pdf',
    "virus_scan_status" "VirusScanStatus" NOT NULL DEFAULT 'PENDING',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("resume_id")
);

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;
