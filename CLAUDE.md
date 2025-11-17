# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sistema de Control de Asistencia - A comprehensive attendance tracking system built with Next.js 14, featuring role-based authentication and Excel import capabilities.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (beta)
- **UI Components**: shadcn/ui + Tailwind CSS
- **File Processing**: xlsx library for Excel imports

## Development Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Database Setup

1. Ensure MySQL is running locally or update DATABASE_URL in .env
2. Copy .env.example to .env and configure:
   - DATABASE_URL: MySQL connection string
   - NEXTAUTH_SECRET: Generate with `openssl rand -base64 32`
   - NEXTAUTH_URL: Application URL (default: http://localhost:3000)

3. Run migrations:
```bash
npx prisma migrate dev
```

4. (Optional) Seed initial data or create users via /auth/register

## Architecture

### Database Schema (Prisma)

**Models:**
- `User`: Users with email, password (hashed), role (SUPERADMIN/ADMIN/USER)
- `Attendance`: Attendance records linked to users with status, check-in/out times, notes
- `Account`, `Session`, `VerificationToken`: NextAuth required tables

**Roles & Permissions:**
- **SUPERADMIN**: Full access, can manage users
- **ADMIN**: Can manage all attendance records
- **USER**: Can only view their own attendance

### Authentication Flow

- Credential-based authentication using NextAuth.js
- Password hashing with bcryptjs
- JWT session strategy
- Role information stored in session token
- Middleware protects routes based on user role (src/middleware.ts)

### Route Structure

```
/auth/login          - Login page
/auth/register       - Registration page
/dashboard           - Main dashboard (protected)
/dashboard/my-attendance     - User's own attendance records
/dashboard/attendance        - Attendance management (ADMIN/SUPERADMIN)
/dashboard/users            - User management (SUPERADMIN only)
```

### API Routes

```
POST /api/auth/[...nextauth]  - NextAuth handlers
POST /api/register            - User registration
GET  /api/attendance          - Fetch attendances (filtered by role)
POST /api/attendance          - Create attendance record
POST /api/attendance/import   - Import attendances from Excel
```

### Key Files & Directories

- `prisma/schema.prisma`: Database schema definition
- `src/lib/auth.ts`: NextAuth configuration with role support
- `src/lib/prisma.ts`: Prisma client instance
- `src/lib/role-helpers.ts`: Role permission checking utilities
- `src/middleware.ts`: Route protection middleware
- `src/components/ui/`: shadcn/ui components
- `src/components/dashboard/`: Dashboard-specific components
- `src/app/`: Next.js App Router pages and layouts

### Excel Import Format

The attendance import feature expects CSV/Excel files with these columns:
- `email` (required): User email to match against database
- `fecha` (required): Attendance date
- `estado` (required): Status (PRESENT, ABSENT, LATE, JUSTIFIED)
- `entrada` (optional): Check-in datetime
- `salida` (optional): Check-out datetime
- `notas` (optional): Notes/comments

## Important Conventions

- All user-facing text is in Spanish
- Dates use es-ES locale formatting
- Components use "use client" directive where hooks/interactivity needed
- API routes validate user session and role permissions
- Password minimum length: 6 characters
- Database uses cuid() for IDs

## Role Helper Functions

Located in `src/lib/role-helpers.ts`:
- `canManageUsers(role)`: Check if user can manage users
- `canManageAttendance(role)`: Check if user can manage attendance
- `canViewAllAttendance(role)`: Check if user can view all attendance records
- `isSuperAdmin(role)`, `isAdmin(role)`, `isUser(role)`: Role checks
