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
```

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
```

Frontend:

```bash
npm run build
npm run preview
```
