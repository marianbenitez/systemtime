"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { canManageUsers, canManageAttendance } from "@/lib/role-helpers"

interface NavItem {
  title: string
  href: string
  icon?: string
  requiredRoles?: string[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Mi Asistencia",
    href: "/dashboard/my-attendance",
  },
  {
    title: "Gestionar Asistencia",
    href: "/dashboard/attendance",
  },
  {
    title: "Usuarios",
    href: "/dashboard/users",
  },
  {
    title: "--- Sistema Biométrico ---",
    href: "#",
  },
  {
    title: "Importar Marcaciones",
    href: "/dashboard/marcaciones",
  },
  {
    title: "Importación Dual (Recomendado)",
    href: "/dashboard/marcaciones-dual",
  },
  {
    title: "Empleados Biométrico",
    href: "/dashboard/empleados-biometrico",
  },
  {
    title: "Generar Informes",
    href: "/dashboard/informes",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useCurrentUser()

  const canAccessItem = (item: NavItem) => {
    if (item.href === "/dashboard/users") {
      return canManageUsers(user?.role)
    }
    if (item.href === "/dashboard/attendance") {
      return canManageAttendance(user?.role)
    }
    // Sistema biométrico accesible para admins
    if (item.href === "/dashboard/marcaciones" || item.href === "/dashboard/marcaciones-dual" || item.href === "/dashboard/empleados-biometrico" || item.href === "/dashboard/informes") {
      return canManageAttendance(user?.role)
    }
    return true
  }

  return (
    <div className="flex h-full w-64 flex-col gap-2 border-r bg-gray-50 p-4">
      <div className="flex-1 space-y-1">
        {navItems.filter(canAccessItem).map((item) => {
          if (item.href === "#") {
            return (
              <div key={item.title} className="px-3 py-2 text-xs font-semibold text-gray-500 mt-4">
                {item.title}
              </div>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100",
                pathname === item.href
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-600"
              )}
            >
              {item.title}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
