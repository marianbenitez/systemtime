# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sistema de Control de Asistencia - A comprehensive attendance tracking system built with Next.js, featuring role-based authentication and Excel import capabilities.

## Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **Runtime**: React 19.2.0
- **Language**: TypeScript
- **Database**: MySQL 8.0+ with Prisma ORM v6.19.0
- **Authentication**: NextAuth.js v5.0.0-beta.30
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v4
- **Form Handling**: react-hook-form v7.66.0
- **Validation**: Zod v4.1.12
- **Password Hashing**: bcryptjs v3.0.3
- **File Processing**: xlsx v0.18.5 for Excel imports
- **Icons**: lucide-react v0.554.0

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

1. Ensure MySQL 8.0+ is running locally
2. Create a `.env` file in the project root with:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/attendance_db"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"
   NODE_ENV="development"
   ```
   **Note**: `.env.example` is referenced in docs but currently missing from repository. Above shows required variables.

3. Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. Create initial users:
   - Visit `/auth/register` to create your first user
   - Update user role in database directly: `UPDATE users SET role = 'SUPERADMIN' WHERE email = 'your@email.com'`
   - Or use Prisma Studio: `npx prisma studio`

## Architecture

### Database Schema (Prisma)

**Primary Models:**

1. **User** (`users` table)
   - `id`: String (cuid, primary key)
   - `email`: String (unique, indexed)
   - `name`: String
   - `password`: String (bcryptjs hashed, 12 rounds)
   - `role`: Enum (SUPERADMIN | ADMIN | USER) - default: USER
   - `createdAt`, `updatedAt`: DateTime
   - Relations: `attendances[]` (one-to-many)

2. **Attendance** (`attendances` table)
   - `id`: String (cuid, primary key)
   - `userId`: String (foreign key, cascade delete)
   - `user`: User relation
   - `date`: DateTime (indexed for query performance)
   - `status`: Enum (PRESENT | ABSENT | LATE | JUSTIFIED)
   - `checkIn`: DateTime (optional)
   - `checkOut`: DateTime (optional)
   - `notes`: Text (optional)
   - `createdAt`, `updatedAt`: DateTime
   - Unique constraint: None (allows multiple entries per user/date if needed)

**NextAuth Tables:**
- `Account`: OAuth account linkage (provider, tokens, etc.)
- `Session`: User sessions (sessionToken, expires)
- `VerificationToken`: Email verification tokens

**Roles & Permissions:**
- **SUPERADMIN**: Full system access, user management, all attendance records
- **ADMIN**: Manage all attendance records, cannot manage users
- **USER**: View and manage only their own attendance

### Authentication Flow

**Configuration** (`src/lib/auth.ts`):
- **Provider**: CredentialsProvider (email + password only, no OAuth currently)
- **Adapter**: PrismaAdapter for database integration
- **Session Strategy**: JWT (server-side validation)
- **Password Hashing**: bcryptjs with 12 salt rounds
- **Session Extension**:
  - JWT callback adds `id` and `role` to token
  - Session callback exposes `id` and `role` in `session.user`
- **Redirect URLs**: Sign-in page at `/auth/login`

**Route Protection** (`src/middleware.ts`):
- Uses NextAuth `withAuth` middleware
- Protected patterns: `/dashboard/:path*`, `/admin/:path*`, `/attendance/:path*`
- Validates JWT token and role for each request
- Redirects unauthorized users to `/dashboard` or login page

**Client-Side Access** (`src/lib/hooks/use-current-user.ts`):
- Custom hook `useCurrentUser()` wraps NextAuth's `useSession()`
- Returns: `{ user, isLoading, isAuthenticated }`
- Available to all client components wrapped in `SessionProvider`

### Route Structure

**Public Routes:**
- `/` - Root page (currently unused Next.js template, should redirect to dashboard)
- `/auth/login` - Login page with email/password form
- `/auth/register` - Registration page (creates USER role by default)

**Protected Routes** (all require authentication):
- `/dashboard` - Main dashboard overview (shows user info cards)
- `/dashboard/my-attendance` - User's own attendance records (all roles)
- `/dashboard/attendance` - Attendance management with Excel import (ADMIN/SUPERADMIN only)
- `/dashboard/users` - User management (**NOT YET IMPLEMENTED**, SUPERADMIN only)

**Dashboard Layout** (`/dashboard/layout.tsx`):
- Includes Navbar (top) and Sidebar (left) components
- Sidebar items filtered by role permissions
- Full-height responsive layout

### API Routes

**Authentication:**
- `POST /api/auth/[...nextauth]` - NextAuth handlers (login, logout, session)
- `POST /api/register` - User registration
  - Body: `{ email, name, password }`
  - Validates: email uniqueness, password min 6 chars
  - Returns: Created user (password excluded) with 201 status
  - Errors: 400 (validation), 500 (server error)

**Attendance Management:**
- `GET /api/attendance` - Fetch attendance records
  - Query params: `userId` (optional), `startDate` (optional), `endDate` (optional)
  - **Role filtering**:
    - ADMIN/SUPERADMIN: Can fetch all records or filter by userId
    - USER: Only gets their own records (userId forced)
  - Returns: Array of attendance objects with user information
  - Sorted by date descending

- `POST /api/attendance` - Create attendance record
  - Body: `{ date, status, userId?, checkIn?, checkOut?, notes? }`
  - Required: `date`, `status` (PRESENT|ABSENT|LATE|JUSTIFIED)
  - Optional: `userId` (defaults to session.user.id), `checkIn`, `checkOut`, `notes`
  - Returns: Created attendance with user info
  - Errors: 401 (not authenticated), 400 (validation)

- `POST /api/attendance/import` - Bulk import from Excel/CSV
  - **Authorization**: ADMIN or SUPERADMIN only (returns 403 otherwise)
  - Content-Type: `multipart/form-data`
  - File types: `.xlsx`, `.xls`, `.csv`
  - Returns: `{ success: number, errors: number, errorDetails: string[] }`
  - See "Excel Import Format" section for column structure

### Project Structure

```
/home/user/systemtime/
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migration history
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # API routes
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── attendance/
│   │   │       ├── route.ts       # GET/POST attendance
│   │   │       └── import/route.ts
│   │   ├── auth/                  # Auth pages
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/             # Protected dashboard
│   │   │   ├── page.tsx           # Dashboard overview
│   │   │   ├── layout.tsx         # Dashboard layout
│   │   │   ├── my-attendance/page.tsx
│   │   │   └── attendance/page.tsx
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Root page (unused template)
│   │   └── globals.css            # Tailwind CSS + theme variables
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (11 files)
│   │   │   ├── avatar.tsx, badge.tsx, button.tsx
│   │   │   ├── card.tsx, dialog.tsx, dropdown-menu.tsx
│   │   │   ├── form.tsx, input.tsx, label.tsx
│   │   │   └── select.tsx, table.tsx
│   │   ├── dashboard/
│   │   │   ├── navbar.tsx         # Top navigation with user menu
│   │   │   ├── sidebar.tsx        # Left sidebar with role-based items
│   │   │   └── import-excel.tsx   # Excel import dialog
│   │   └── providers/
│   │       └── session-provider.tsx  # NextAuth SessionProvider wrapper
│   ├── lib/
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── role-helpers.ts        # Role permission utilities
│   │   ├── utils.ts               # cn() class name merger
│   │   └── hooks/
│   │       └── use-current-user.ts  # useCurrentUser() hook
│   └── middleware.ts              # NextAuth route protection
├── public/                        # Static assets
├── .env                           # Environment variables (not in repo)
├── .gitignore
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── next.config.ts                 # Next.js configuration
├── prisma.config.ts               # Prisma configuration
├── components.json                # shadcn/ui configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── postcss.config.mjs             # PostCSS configuration
├── eslint.config.mjs              # ESLint configuration
├── CLAUDE.md                      # This file
└── README.md                      # Project README
```

### Excel Import Format

The attendance import feature (`/dashboard/attendance` page, ADMIN+ only) expects CSV/Excel files with these columns:

**Required Columns:**
- `email`: User email to match against database (must exist in users table)
- `fecha`: Attendance date (any standard date format)
- `estado`: Status - must be one of: PRESENT, ABSENT, LATE, JUSTIFIED

**Optional Columns:**
- `entrada`: Check-in datetime
- `salida`: Check-out datetime
- `notas`: Notes/comments (text)

**Import Process:**
1. Click "Importar Excel" button on attendance page
2. Download template CSV for reference (includes sample data)
3. Upload filled Excel/CSV file
4. System validates each row and provides detailed error feedback
5. Successfully imported records appear in attendance table

**Error Handling:**
- Invalid email: Skips row, reports "Usuario no encontrado"
- Invalid status: Skips row, reports allowed values
- Missing required fields: Skips row with error message
- Import summary shows: success count, error count, detailed error list

### Dashboard Components

**Navbar** (`src/components/dashboard/navbar.tsx`):
- Fixed top navigation bar with "Sistema de Asistencia" title
- User dropdown menu showing name, email, role badge
- Role badge colors: SUPERADMIN (purple), ADMIN (blue), USER (gray)
- Logout button triggers NextAuth signOut
- Client component using useCurrentUser hook

**Sidebar** (`src/components/dashboard/sidebar.tsx`):
- Left navigation panel with role-based menu items
- Navigation items:
  - Dashboard (all roles)
  - Mi Asistencia (all roles)
  - Gestionar Asistencia (ADMIN/SUPERADMIN) - uses `canManageAttendance()`
  - Usuarios (SUPERADMIN only) - uses `canManageUsers()`
- Active route highlighting with different background color
- Client component using usePathname for active detection

**ImportExcel** (`src/components/dashboard/import-excel.tsx`):
- Dialog modal for Excel file upload
- Features: file input, template download, upload progress
- Success/error feedback with detailed error list
- Calls `/api/attendance/import` with FormData
- Triggers callback on success to refresh attendance table

### Custom Hooks

**useCurrentUser** (`src/lib/hooks/use-current-user.ts`):
```typescript
const { user, isLoading, isAuthenticated } = useCurrentUser()
```
- Wraps NextAuth's `useSession()` hook
- Returns user object with `id`, `email`, `name`, `role`
- `isLoading`: true while session is being fetched
- `isAuthenticated`: true if user is logged in
- Use in client components only

## Important Conventions

**Language & Localization:**
- All user-facing text is in Spanish
- Dates formatted with `es-ES` locale: `toLocaleDateString('es-ES')`
- Times formatted with `es-ES` locale: `toLocaleTimeString('es-ES')`
- Database fields use Spanish: `fecha`, `estado`, `entrada`, `salida`, `notas`

**Code Organization:**
- Client components must use `"use client"` directive at top of file
- Server components (default) can access database directly
- API routes always validate session and role permissions before processing
- Use role helper functions instead of direct role string comparison
- All components use TypeScript with strict mode

**Security:**
- Passwords hashed with bcryptjs (12 rounds) before storage
- Minimum password length: 6 characters (consider increasing to 8+)
- JWT tokens validated on every protected route via middleware
- CSRF protection enabled by default in NextAuth
- No sensitive data in client-side session (only id, email, name, role)

**Database:**
- All IDs use `cuid()` for unique, distributed-safe identifiers
- Timestamps auto-managed: `createdAt`, `updatedAt`
- Foreign key constraints with cascade delete (User → Attendance)
- Indexed fields: `email`, `date`, `userId` for query performance

**Styling:**
- Tailwind CSS v4 with CSS variables for theming
- Dark mode support via `.dark` class (toggle not implemented)
- shadcn/ui components styled with "new-york" variant
- Color system uses oklch() for better perceptual uniformity
- Use `cn()` utility to merge Tailwind classes conditionally

**Status Badge Colors:**
- PRESENT: green (`bg-green-100 text-green-800`)
- ABSENT: red (`bg-red-100 text-red-800`)
- LATE: yellow (`bg-yellow-100 text-yellow-800`)
- JUSTIFIED: blue (`bg-blue-100 text-blue-800`)

## Role Helper Functions

Located in `src/lib/role-helpers.ts` - **Always use these instead of direct role checks:**

```typescript
hasRole(role, allowedRoles)      // Generic role checker
isSuperAdmin(role)               // Returns true if SUPERADMIN
isAdmin(role)                    // Returns true if ADMIN or SUPERADMIN
isUser(role)                     // Returns true if USER
canManageUsers(role)             // Returns true if SUPERADMIN only
canManageAttendance(role)        // Returns true if ADMIN or SUPERADMIN
canViewAllAttendance(role)       // Returns true if ADMIN or SUPERADMIN
```

**Example Usage:**
```typescript
import { canManageAttendance } from '@/lib/role-helpers'

if (canManageAttendance(session.user.role)) {
  // Show admin features
}
```

## Known Gaps & Future Improvements

**Missing Implementations:**
1. **User Management Page** (`/dashboard/users`):
   - Sidebar link exists but page not implemented
   - Should allow SUPERADMIN to: create, edit, delete users, change roles
   - Required API routes: GET/POST/PUT/DELETE `/api/users`

2. **Manual Attendance Registration**:
   - "Registrar Asistencia" button exists but no functionality
   - Should open dialog to create attendance record manually
   - Form fields: user (dropdown), date, status, times, notes

3. **Root Page Redirect**:
   - `/` still shows default Next.js template
   - Should redirect authenticated users to `/dashboard`
   - Should show landing page or redirect to `/auth/login` for guests

4. **Edit/Delete Attendance**:
   - No UI to edit or delete existing attendance records
   - Consider adding actions column to attendance tables

**Missing Files:**
- `.env.example`: Should be created with template environment variables

**Security Enhancements Needed:**
- Password strength requirements (currently only 6 chars)
- Email verification flow
- Password reset functionality
- Account lockout after failed login attempts
- Rate limiting on API routes
- Audit log for user/attendance changes

**UX Improvements:**
- Loading skeletons instead of "Cargando..." text
- Error boundaries for better error handling
- Toast notifications for success/error messages
- Pagination for attendance tables (currently loads all)
- Date range filters on attendance pages
- Search functionality on attendance tables
- Export attendance to Excel/PDF

**Dark Mode:**
- CSS variables exist in `globals.css`
- Toggle UI not implemented
- Add theme switcher to navbar

## Development Tips

**Adding a New Page:**
1. Create page file: `src/app/your-route/page.tsx`
2. Add to sidebar if needed: `src/components/dashboard/sidebar.tsx`
3. Update middleware if route needs protection: `src/middleware.ts`
4. Add role checks if needed using helper functions

**Adding a New API Route:**
1. Create route file: `src/app/api/your-route/route.ts`
2. Always validate session: `const session = await auth()`
3. Check permissions using role helpers before processing
4. Return proper HTTP status codes (200, 201, 400, 401, 403, 500)
5. Use Prisma client from `@/lib/prisma`

**Adding a New shadcn/ui Component:**
```bash
npx shadcn@latest add [component-name]
```
Component will be added to `src/components/ui/`

**Database Changes:**
1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name description`
3. Regenerate client: `npx prisma generate`
4. Update TypeScript types if needed

**Testing Changes:**
1. Run dev server: `npm run dev`
2. Test in browser at http://localhost:3000
3. Check browser console for errors
4. Test with different user roles (create test users with different roles)
5. Build before deploying: `npm run build`

## Common Tasks

**Create a SUPERADMIN user:**
```bash
# Option 1: Via Prisma Studio
npx prisma studio
# Navigate to User model, find user, edit role to SUPERADMIN

# Option 2: Direct SQL (if MySQL CLI available)
mysql -u user -p database_name
UPDATE users SET role = 'SUPERADMIN' WHERE email = 'your@email.com';
```

**Reset Database:**
```bash
npx prisma migrate reset
# Warning: This deletes all data!
```

**View Database:**
```bash
npx prisma studio
# Opens GUI at http://localhost:5555
```

**Check TypeScript Errors:**
```bash
npx tsc --noEmit
```

**Format Code:**
```bash
npm run lint
```

**Update Dependencies:**
```bash
npm update
# Or for specific package:
npm update package-name
```

## Troubleshooting

**"Prisma Client not generated" error:**
```bash
npx prisma generate
```

**Database connection errors:**
- Check MySQL is running
- Verify DATABASE_URL in `.env`
- Check MySQL user has proper permissions
- Ensure database exists

**NextAuth errors:**
- Verify NEXTAUTH_SECRET is set in `.env`
- Check NEXTAUTH_URL matches your app URL
- Clear browser cookies if session issues persist

**Build errors:**
- Run `npx prisma generate` before build
- Check for TypeScript errors: `npx tsc --noEmit`
- Clear `.next` folder: `rm -rf .next && npm run build`

**Import not working:**
- Check file has correct columns (email, fecha, estado)
- Verify user emails exist in database
- Check status values are exactly: PRESENT, ABSENT, LATE, or JUSTIFIED
- Look at error details in import result dialog
