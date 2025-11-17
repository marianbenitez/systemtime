import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { Role } from "@/generated/prisma"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Rutas que requieren SUPERADMIN
    if (path.startsWith("/admin/users") && token?.role !== Role.SUPERADMIN) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Rutas que requieren ADMIN o SUPERADMIN
    if (
      path.startsWith("/admin") &&
      token?.role !== Role.ADMIN &&
      token?.role !== Role.SUPERADMIN
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/attendance/:path*"],
}
