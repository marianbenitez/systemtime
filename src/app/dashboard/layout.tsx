"use client"

import { Navbar } from "@/components/dashboard/navbar"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log("🏗️ [DASHBOARD-LAYOUT] Layout montado")
    console.log("📍 [DASHBOARD-LAYOUT] Location:", window.location.href)
    console.log("📊 [DASHBOARD-LAYOUT] Session status:", status)
    console.log("👤 [DASHBOARD-LAYOUT] User:", session?.user?.email)

    if (status === "loading") {
      console.log("⏳ [DASHBOARD-LAYOUT] Cargando sesión...")
      return
    }

    if (status === "unauthenticated") {
      console.error("❌ [DASHBOARD-LAYOUT] No autenticado, redirigiendo a login")
      router.push("/auth/login")
      return
    }

    console.log("✅ [DASHBOARD-LAYOUT] Sesión válida, mostrando dashboard")
  }, [status, session, router])

  // Mostrar loading mientras se verifica la sesión
  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // No mostrar nada si no está autenticado (mientras redirige)
  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
