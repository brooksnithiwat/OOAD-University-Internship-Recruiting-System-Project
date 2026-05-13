# Phase 1 Auth & Register Module - Setup Guide

## ✅ Generation Complete 

All 22+ files have been successfully generated for the NestJS backend auth module. This guide covers setup, testing, and deployment.

## 📋 Generated Files Summary

### Core Foundation
```
src/
├── prisma/
│   ├── prisma.service.ts        ✓ Global Prisma client
│   └── prisma.module.ts         ✓ Global Prisma module
├── main.ts                       ✓ Application entry point
└── app.module.ts                 ✓ Root module
```

### Authentication Layer
```
src/auth/
├── auth.controller.ts            ✓ API endpoints
├── auth.service.ts               ✓ Auth business logic
├── auth.module.ts                ✓ Auth module
├── strategies/
│   └── jwt.strategy.ts           ✓ Passport JWT strategy
├── guards/
│   ├── jwt-auth.guard.ts         ✓ JWT authentication guard
│   └── roles.guard.ts            ✓ Role-based access control
└── dto/
    └── login.dto.ts              ✓ Login request DTO
```

### Domain Modules
```
src/users/                         ✓ User management
├── users.repository.ts
├── users.service.ts
└── users.module.ts

src/students/                      ✓ Student registration
├── students.repository.ts
├── students.service.ts
├── students.module.ts
└── dto/
    └── create-student.dto.ts

src/employers/                     ✓ Employer registration
├── employers.repository.ts
├── employers.service.ts
├── employers.module.ts
└── dto/
    └── create-employer.dto.ts
```

### Common Utilities
```
src/common/
├── enums/
│   ├── role.enum.ts              ✓ Role enumeration
│   └── eligibility-status.enum.ts ✓ Student eligibility status
└── decorators/
    └── roles.decorator.ts        ✓ @Roles() decorator for RBAC
```

## 🔧 Prerequisites

Before running the application, ensure you have:
- Node.js 18+ 
- npm or yarn
- PostgreSQL running locally
- Database created: `intern_db`

## 📦 Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

This will install all required packages including:
- `@nestjs/jwt` - JWT token management
- `@nestjs/passport` - Passport.js integration
- `@nestjs/config` - Environment variable management
- `passport-jwt` - JWT passport strategy
- `bcrypt` - Password hashing
- Other core NestJS packages

### 2. Database Setup
The Prisma schema already exists at `backend/prisma/schema.prisma`

Run migrations:
```bash
npm run prisma:migrate
```

This will create all tables according to the schema.

### 3. Environment Configuration

The `.env` file has been updated with:
```
DATABASE_URL="postgresql://postgres:brooks7121@localhost:5432/intern_db"
PORT=3000
JWT_SECRET="your-secret-key-change-in-production-to-a-strong-random-string"
```

⚠️ **IMPORTANT**: For production, change `JWT_SECRET` to a strong, randomly generated string.

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

The server will start on `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## 🧪 Running Tests

### Run All Tests
```bash
npm run test
```

### Run Tests with Verbose Output
```bash
npm run test -- --verbose
```

This will:
- Execute all test suites in `test/` directory
- Display detailed information about each test
- Show pass/fail status for each test case
- Display any console logs from tests

### Test Files
- `test/auth.service.spec.ts` - Authentication service tests
- `test/job-posts.service.spec.ts` - Job posts service tests
- `test/resume.service.spec.ts` - Resume upload service tests

## 📝 API Endpoints

### 1. Student Registration
**POST** `/auth/register/student`

Request:
```json
{
  "email": "student@example.com",
  "password": "password123",
  "studentCode": "66070503410",
  "firstName": "Supachok",
  "lastName": "Deetaweesukh",
  "gpa": 3.45,
  "faculty": "Engineering",
  "department": "Computer Engineering",
  "academicYear": 3
}
```

Response (201):
```json
{
  "message": "Register successful",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. Employer Registration
**POST** `/auth/register/employer`

Request:
```json
{
  "email": "hr@company.com",
  "password": "password123",
  "companyName": "Acme Corp",
  "industry": "Technology",
  "website": "https://acme.com",
  "contactName": "Jane Doe",
  "contactPhone": "0812345678"
}
```

Response (201):
```json
{
  "message": "Register successful",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 3. Login
**POST** `/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "STUDENT",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 4. Get Current User Profile
**GET** `/auth/me`

Headers:
```
Authorization: Bearer <accessToken>
```

Response (200):
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "student@example.com",
  "role": "STUDENT",
  "profile": {
    "studentId": "550e8400-e29b-41d4-a716-446655440001",
    "studentCode": "66070503410",
    "firstName": "Supachok",
    "lastName": "Deetaweesukh",
    "gpa": 3.45,
    "faculty": "Engineering",
    "department": "Computer Engineering",
    "academicYear": 3,
    "eligibilityStatus": "PENDING"
  }
}
```

## 🔐 Security Features Implemented

### 1. Password Hashing
- Uses `bcrypt` with 10 salt rounds
- Passwords are never stored in plain text
- Comparison uses timing-safe comparison

### 2. JWT Authentication
- Token expiry: 7 days
- Payload contains: `sub` (userId), `email`, `role`
- Extracted from Authorization header as Bearer token
- Secret stored in environment variable

### 3. Role-Based Access Control (RBAC)
- Roles: STUDENT, EMPLOYER, UNIVERSITY_COORDINATOR, DEPARTMENT_HEAD, SYSTEM_ADMINISTRATOR
- Decorator-based authorization: `@Roles(Role.STUDENT, Role.EMPLOYER)`
- RolesGuard validates user permissions

### 4. Input Validation
- All DTOs use `class-validator` decorators
- Email format validation
- Password minimum length enforcement (8 characters)
- GPA range validation (0-4.0)
- Academic year validation (1-6)
- Optional fields properly handled

### 5. Data Consistency
- Prisma transactions ensure atomicity
- Student registration creates User + Student in single transaction
- Employer registration creates User + Employer in single transaction
- Foreign key constraints enforced by database

### 6. Automatic Defaults
- `eligibilityStatus` always defaults to PENDING
- `isVerified` for employers always defaults to false
- Role is determined by endpoint, not user input
- Timestamps automatically managed by Prisma

## 📚 Architecture Overview

### Design Patterns Used

1. **Repository Pattern**
   - `*Repository` classes handle database queries
   - Services call repositories, never query Prisma directly
   - Plain objects returned (no Prisma types leaked)

2. **Service Layer**
   - Business logic encapsulated in `*Service` classes
   - Services validate business rules (unique emails, etc.)
   - Authentication logic centralized in AuthService

3. **Module Pattern**
   - Each domain has dedicated module (UsersModule, StudentsModule, etc.)
   - PrismaModule is global
   - AuthModule imports dependency modules

4. **DTO Pattern**
   - Request validation via class-validator decorated DTOs
   - Automatic transformation and validation
   - Type safety through TypeScript

## 🧪 Testing the Endpoints

### Using cURL

**Register Student:**
```bash
curl -X POST http://localhost:3000/auth/register/student \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "test1234",
    "studentCode": "66070503410",
    "firstName": "John",
    "lastName": "Doe",
    "gpa": 3.5,
    "faculty": "Engineering",
    "department": "CS",
    "academicYear": 3
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "test1234"
  }'
```

**Get Profile (replace TOKEN with actual JWT):**
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman
Import the following collection or create requests manually:
- All endpoints listed in API Endpoints section above

## 🔄 Database Schema Reference

### Users Table
```
- userId (PK): UUID, auto-generated
- email: String, unique, required
- passwordHash: String, hashed with bcrypt
- role: Enum(STUDENT, EMPLOYER, ...)
- isActive: Boolean, default true
- createdAt: DateTime, auto
- updatedAt: DateTime, auto
```

### Students Table
```
- studentId (PK): UUID, auto-generated
- userId (FK): References User
- studentCode: String, unique
- firstName, lastName: String
- gpa: Decimal(3,2)
- faculty, department: String, optional
- academicYear: Int (1-6)
- eligibilityStatus: Enum, default PENDING
- createdAt, updatedAt: DateTime
```

### Employers Table
```
- employerId (PK): UUID, auto-generated
- userId (FK): References User
- companyName: String
- industry, website: String, optional
- contactName, contactPhone: String, optional
- isVerified: Boolean, default false
- createdAt, updatedAt: DateTime
```

## 📋 Business Rules Enforced

✅ Duplicate email prevention - throws `ConflictException (409)`  
✅ Password hashing - bcrypt with 10 rounds  
✅ JWT expiry - 7 days  
✅ Role auto-assignment - determined by endpoint  
✅ Student eligibility - always starts as PENDING  
✅ Employer verification - always starts as false  
✅ Transactional operations - user + profile created atomically  
✅ Password validation - minimum 8 characters  
✅ GPA validation - 0.00-4.00 range  

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
Solution: Ensure PostgreSQL is running and DATABASE_URL is correct

### JWT_SECRET Not Set
```
Error: jwt malformed
```
Solution: Ensure JWT_SECRET is set in .env file

### Migration Conflicts
```
Error: migrations have not been run
```
Solution: Run `npm run prisma:migrate`

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
Solution: Change PORT in .env or kill process using port 3000

## 📖 Next Steps

1. **Implement POST guards** - Add more endpoints with role-based protection
2. **Add refresh tokens** - Implement token refresh mechanism
3. **Email verification** - Add email confirmation before activation
4. **Password reset** - Implement forgot password flow
5. **Audit logging** - Track authentication events
6. **Rate limiting** - Add rate limit to prevent brute force attacks
7. **Two-factor authentication** - Enhance security for sensitive operations

## 📞 Support

All code follows NestJS best practices with:
- Clean architecture principles
- Type safety with TypeScript
- Input validation with class-validator
- Database optimization with Prisma
- Security hardening with JWT and bcrypt

For issues or improvements, refer to the implementation in the respective files.

---

**Status**: ✅ Phase 1 Complete - Ready for Integration Testing
