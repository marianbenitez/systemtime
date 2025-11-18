import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const path = req.nextUrl.pathname

  // Si no hay token y está intentando acceder a rutas protegidas
  if (!token && (path.startsWith("/dashboard") || path.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // Si hay token
  if (token) {
    const userRole = token.role as string

    // Rutas que requieren SUPERADMIN
    if (path.startsWith("/dashboard/users") && userRole !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Rutas que requieren ADMIN o SUPERADMIN
    const adminRoutes = [
      "/dashboard/attendance",
      "/dashboard/marcaciones",
      "/dashboard/empleados-biometrico",
      "/dashboard/informes"
    ]

    if (
      adminRoutes.some(route => path.startsWith(route)) &&
      userRole !== "ADMIN" &&
      userRole !== "SUPERADMIN"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
