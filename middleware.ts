import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get("authjs.session-token") || req.cookies.get("__Secure-authjs.session-token")
  const isLoggedIn = !!sessionCookie
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  const isOnLoginPage = req.nextUrl.pathname.startsWith("/auth/login")

  console.log("🛡️ [MIDDLEWARE] Ejecutando middleware")
  console.log("📍 [MIDDLEWARE] Path:", req.nextUrl.pathname)
  console.log("🔐 [MIDDLEWARE] Logged in:", isLoggedIn)
  console.log("🍪 [MIDDLEWARE] Session cookie:", sessionCookie?.name)

  // Si está en dashboard pero no está logueado, redirigir a login
  if (isOnDashboard && !isLoggedIn) {
    console.log("❌ [MIDDLEWARE] No autenticado, redirigiendo a login")
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // Si está en login pero ya está logueado, redirigir a dashboard
  if (isOnLoginPage && isLoggedIn) {
    console.log("✅ [MIDDLEWARE] Ya autenticado, redirigiendo a dashboard")
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  console.log("✅ [MIDDLEWARE] Permitiendo acceso")
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login"]
}
