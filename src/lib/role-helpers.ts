import { Role } from "@/generated/prisma"

export function hasRole(userRole: Role | undefined, allowedRoles: Role[]): boolean {
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}

export function isSuperAdmin(userRole: Role | undefined): boolean {
  return userRole === Role.SUPERADMIN
}

export function isAdmin(userRole: Role | undefined): boolean {
  return userRole === Role.ADMIN || userRole === Role.SUPERADMIN
}

export function isUser(userRole: Role | undefined): boolean {
  return userRole === Role.USER
}

export function canManageUsers(userRole: Role | undefined): boolean {
  return userRole === Role.SUPERADMIN
}

export function canManageAttendance(userRole: Role | undefined): boolean {
  return userRole === Role.ADMIN || userRole === Role.SUPERADMIN
}

export function canViewAllAttendance(userRole: Role | undefined): boolean {
  return userRole === Role.ADMIN || userRole === Role.SUPERADMIN
}
