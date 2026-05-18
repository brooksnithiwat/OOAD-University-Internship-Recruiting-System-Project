-- Convert all existing departments to lowercase in students table
UPDATE "students" SET department = LOWER(department) WHERE department IS NOT NULL AND department != LOWER(department);

-- Convert all existing departments to lowercase in department_heads table
UPDATE "department_heads" SET department = LOWER(department) WHERE department IS NOT NULL AND department != LOWER(department);

-- Convert all existing departments to lowercase in university_coordinators table
UPDATE "university_coordinators" SET department = LOWER(department) WHERE department IS NOT NULL AND department != LOWER(department);
