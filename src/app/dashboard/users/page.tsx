"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { useCurrentUser } from "@/lib/hooks/use-current-user"
import { canManageUsers } from "@/lib/role-helpers"
import { UserDialog } from "@/components/users/user-dialog"

interface User {
  id: string
  email: string
  name: string
  role: "SUPERADMIN" | "ADMIN" | "USER"
  createdAt: string
}

export default function UsersPage() {
  const router = useRouter()
  const { user: currentUser } = useCurrentUser()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Verificar permisos
  useEffect(() => {
    if (currentUser && !canManageUsers(currentUser.role)) {
      router.push("/dashboard")
    }
  }, [currentUser, router])

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")

      if (!response.ok) {
        throw new Error("Error al cargar usuarios")
      }

      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error:", error)
      alert("Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Manejar creación/edición de usuario
  const handleSaveUser = async (userData: {
    email: string
    password?: string
    name: string
    role: string
  }) => {
    try {
      const url = editingUser
        ? `/api/users/${editingUser.id}`
        : "/api/users"

      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al guardar usuario")
      }

      // Recargar usuarios
      await loadUsers()
      setDialogOpen(false)
      setEditingUser(null)
    } catch (error) {
      console.error("Error:", error)
      throw error // Re-lanzar para que el diálogo lo maneje
    }
  }

  // Manejar eliminación de usuario
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      setDeletingId(userId)
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar usuario")
      }

      // Recargar usuarios
      await loadUsers()
    } catch (error) {
      console.error("Error:", error)
      alert(error instanceof Error ? error.message : "Error al eliminar usuario")
    } finally {
      setDeletingId(null)
    }
  }

  // Abrir diálogo para crear nuevo usuario
  const handleNewUser = () => {
    setEditingUser(null)
    setDialogOpen(true)
  }

  // Abrir diálogo para editar usuario
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setDialogOpen(true)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return "bg-purple-500"
      case "ADMIN":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (!currentUser || !canManageUsers(currentUser.role)) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">
            Administra los usuarios del sistema
          </p>
        </div>
        <Button onClick={handleNewUser}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>
            Lista de todos los usuarios del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay usuarios registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deletingId === user.id || user.id === currentUser.id}
                        >
                          {deletingId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  )
}
