"use client"

import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { canManageAttendance } from "@/lib/role-helpers"

export default function DashboardPage() {
  const { user } = useCurrentUser()
  const [stats, setStats] = useState<any>(null)

  console.log("🏠 [DASHBOARD] Componente montado")
  console.log("👤 [DASHBOARD] Usuario:", user)

  useEffect(() => {
    console.log("⚡ [DASHBOARD] useEffect ejecutado")
    console.log("👤 [DASHBOARD] Usuario en useEffect:", user)
    console.log("🔐 [DASHBOARD] Rol del usuario:", user?.role)
    console.log("✅ [DASHBOARD] Puede gestionar asistencia:", canManageAttendance(user?.role))

    if (canManageAttendance(user?.role)) {
      console.log("📊 [DASHBOARD] Obteniendo estadísticas...")
      fetch('/api/estadisticas')
        .then(res => {
          console.log("📥 [DASHBOARD] Respuesta de estadísticas recibida:", res.status)
          return res.json()
        })
        .then(data => {
          console.log("📊 [DASHBOARD] Estadísticas:", data)
          setStats(data)
        })
        .catch(err => {
          console.error("❌ [DASHBOARD] Error al obtener estadísticas:", err)
        })
    } else {
      console.log("⚠️ [DASHBOARD] Usuario sin permisos para ver estadísticas")
    }
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bienvenido, {user?.name}</h1>
        <p className="text-gray-500">
          Panel de control del sistema de asistencia
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tu Rol</CardTitle>
            <CardDescription>Rol asignado en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user?.role}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado</CardTitle>
            <CardDescription>Estado de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">Activo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>Tu correo electrónico</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{user?.email}</p>
          </CardContent>
        </Card>
      </div>

      {canManageAttendance(user?.role) && stats && (
        <>
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Estadísticas Sistema Biométrico</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Empleados Activos</CardTitle>
                <CardDescription>Total de empleados registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-600">{stats.totalEmpleados}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Marcaciones</CardTitle>
                <CardDescription>Marcaciones procesadas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600">{stats.totalMarcaciones}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Días con Errores</CardTitle>
                <CardDescription>Días con problemas de marcación</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-red-600">{stats.diasConErrores}</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
