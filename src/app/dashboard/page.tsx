"use client"

import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const { user } = useCurrentUser()

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
    </div>
  )
}
