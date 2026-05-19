# OOAD University Internship Recruiting System

A full-stack recruiting system built with React, NestJS, Prisma, and PostgreSQL.

## Project Structure

- `frontend/`: React + TypeScript + Vite UI
- `backend/`: NestJS API with Prisma
- `backend/prisma/`: Prisma schema and migrations
- `docker-compose.yml`: local Docker orchestration for the full stack

## Environment Files

The project uses separate environment files for the backend and frontend:

- `backend/.env.example`
	- `DATABASE_URL="postgresql://user:password@localhost:5432/mydb"`
	- `PORT=3000`
	- `JWT_SECRET=your_jwt_secret_key`
	- `FRONTEND_URL=http://localhost:5173`
	- `SMTP_HOST=smtp.gmail.com`
	- `SMTP_PORT=587`
	- `SMTP_USER=your-email@gmail.com`
	- `SMTP_PASS=your-gmail-app-password`
	- `SMTP_FROM=your-email@gmail.com`
- `frontend/.env.example`
	- `VITE_API_URL="http://localhost:3000"`

## Run the Whole Project With Docker

Docker is the easiest way to run everything together. It starts PostgreSQL, the backend API, and the frontend app.

### 1. Create the root `.env`

The `docker-compose.yml` file reads its values from the root `.env` file. Make sure it contains values like these:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
VITE_API_URL=http://localhost:3000
```

### 2. Start the stack

```bash
docker compose up --build
```

What happens:

- PostgreSQL starts on `localhost:5432`
- The backend runs Prisma migrations and starts on `http://localhost:3000`
- The frontend starts on `http://localhost:5173`

### 3. Stop the stack

```bash
docker compose down
```

To stop everything and remove the database volume as well:

```bash
docker compose down -v
```

## Run the Backend Separately

Use this if you want to work on the API without Docker.

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Copy `backend/.env.example` to `backend/.env` and update the values for your local setup:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
PORT=3000
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=your-email@gmail.com
```

For production email delivery with Gmail, use a Google App Password and keep the `SMTP_FROM` address aligned with the Gmail account or a verified alias.

### 3. Prepare Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start the backend

```bash
npm run start:dev
```

The backend runs at `http://localhost:3000`.

## Run the Frontend Separately

Use this if you want to work on the UI without Docker.

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment variables

Copy `frontend/.env.example` to `frontend/.env` and make sure it points to the backend API:

```env
VITE_API_URL="http://localhost:3000"
```

### 3. Start the frontend

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Useful Commands

Backend:

```bash
npm run build
npm run test
npm run prisma:seed  # Seed the database with test data
```

Frontend:

```bash
npm run build
npm run preview
```

## Seed Data & Test Credentials

The database comes with pre-seeded test users for development and testing. Run the seed command to populate the database:

```bash
cd backend
npm run prisma:seed
```

### Available Test Accounts

| Role | Email | Password |
|------|-------|----------|
| System Administrator | `admin@email.com` | `Admin_1234` |
| Employer | `employee@email.com` | `Employee_1234` |
| Student | `student@email.com` | `Student_1234` |

### Seeded Data Details

**Admin User:**
- Email: `admin@email.com`
- Password: `Admin_1234`
- Role: `SYSTEM_ADMINISTRATOR`
- Access: Full system access, user management dashboard

**Employer User:**
- Email: `employee@email.com`
- Password: `Employee_1234`
- Role: `EMPLOYER`
- Company: Tech Company
- Status: Verified employer account
- Access: Can post jobs and view applications

**Student User:**
- Email: `student@email.com`
- Password: `Student_1234`
- Role: `STUDENT`
- Student Code: `STU001`
- Faculty: Engineering
- Department: Computer Science
- Academic Year: 2024
- GPA: 3.5
- Access: Can apply to jobs and manage profile

### Notes

- All emails are stored in **lowercase** in the database
- Passwords are hashed using bcrypt with salt rounds of 10
- Test accounts are idempotent (running seed multiple times is safe)
- Modify `backend/prisma/seed.ts` to customize seed data

## Resume Upload Storage

The system supports **two storage modes** for resume uploads:

### 1. LOCAL Storage (Default)
Used when Supabase environment variables are not configured.

**Configuration:**
- Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_BUCKET_NAME` to empty or missing values
- Files are stored in `./uploads/` directory
- Suitable for **local development** and testing

**Usage:**
```env
# Remove or comment out Supabase variables
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
# SUPABASE_BUCKET_NAME=
```

### 2. SUPABASE Storage (Cloud)
Used when all three Supabase environment variables are configured.

**Configuration:**
Add the following to `backend/.env`:

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_BUCKET_NAME="resume"
```

**Steps to set up:**

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to **Storage** → Create a new bucket named `resume`
3. In bucket settings, **disable Row Level Security (RLS)** for public access
4. Copy your project URL and anon key from **Settings** → **API**
5. Add these values to your `.env` file
6. Files are uploaded to Supabase Storage and served via public URLs
7. Suitable for **production** deployments

### How It Works

The system automatically detects which storage mode to use:

- **If all Supabase variables are present** → Uses Supabase Storage
- **If any Supabase variable is missing or empty** → Falls back to Local Storage

API responses are identical regardless of storage mode:

```json
{
  "resumeId": "uuid",
  "fileName": "resume.pdf",
  "fileRef": "https://... (Supabase) or uploads/... (Local)",
  "fileSizeBytes": 102400,
  "uploadedAt": "2026-05-13T10:30:00Z"
}
```

### Testing Both Modes

**Test Local Mode:**
```bash
# .env - comment out Supabase variables
cd backend
npm run start:dev
# Upload resume via API → file saved to ./uploads/
```

**Test Supabase Mode:**
```bash
# .env - add all Supabase variables
cd backend
npm run start:dev
# Upload resume via API → file uploaded to Supabase bucket
```

**Switch Between Modes:**
1. Upload a file in one mode
2. Disable that mode's configuration
3. Restart the backend
4. Existing files remain accessible (URL stored in database)
5. New uploads use the newly activated mode

### Resume Endpoints

- `POST /resumes/upload` - Upload a new resume (PDF, max 5MB)
- `GET /resumes` - List all resumes for authenticated student
- `GET /resumes/:id` - Get a specific resume
- `DELETE /resumes/:id` - Delete a resume

All endpoints work seamlessly with both storage modes.
