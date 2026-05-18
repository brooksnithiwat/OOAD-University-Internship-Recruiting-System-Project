-- CreateTable
CREATE TABLE "university_coordinators" (
    "coordinator_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "department" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "university_coordinators_pkey" PRIMARY KEY ("coordinator_id")
);

-- CreateTable
CREATE TABLE "department_heads" (
    "head_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_heads_pkey" PRIMARY KEY ("head_id")
);

-- CreateTable
CREATE TABLE "eligibility_verifications" (
    "verification_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "verified_by" TEXT NOT NULL,
    "previous_status" TEXT NOT NULL,
    "new_status" TEXT NOT NULL,
    "notes" TEXT,
    "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eligibility_verifications_pkey" PRIMARY KEY ("verification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "university_coordinators_user_id_key" ON "university_coordinators"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "department_heads_user_id_key" ON "department_heads"("user_id");

-- AddForeignKey
ALTER TABLE "university_coordinators" ADD CONSTRAINT "university_coordinators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_heads" ADD CONSTRAINT "department_heads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eligibility_verifications" ADD CONSTRAINT "eligibility_verifications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eligibility_verifications" ADD CONSTRAINT "eligibility_verifications_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "university_coordinators"("coordinator_id") ON DELETE RESTRICT ON UPDATE CASCADE;
