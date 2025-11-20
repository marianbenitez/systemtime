"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: {
    id: string
    email: string
    name: string
    role: string
  } | null
  onSave: (userData: {
    email: string
    password?: string
    name: string
    role: string
  }) => Promise<void>
}

export function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<string>("USER")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Resetear formulario cuando se abre/cierra el diálogo
  useEffect(() => {
    if (open) {
      if (user) {
        // Modo edición
        setEmail(user.email)
        setName(user.name)
        setRole(user.role)
        setPassword("") // No pre-llenar la contraseña
      } else {
        // Modo creación
        setEmail("")
        setPassword("")
        setName("")
        setRole("USER")
      }
      setError("")
    }
  }, [open, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones
    if (!email || !name || !role) {
      setError("Email, nombre y rol son requeridos")
      return
    }

    if (!user && !password) {
      setError("La contraseña es requerida para nuevos usuarios")
      return
    }

    if (password && password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      setLoading(true)

      const userData: any = {
        email,
        name,
        role
      }

      // Solo incluir password si se proporcionó
      if (password) {
        userData.password = password
      }

      await onSave(userData)
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Error al guardar usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {user ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {user
                ? "Modifica los datos del usuario. Deja la contraseña vacía si no deseas cambiarla."
                : "Completa los datos para crear un nuevo usuario."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Pérez"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">
                Contraseña {user && "(dejar vacío para no cambiar)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={user ? "••••••••" : "Mínimo 6 caracteres"}
                required={!user}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={role}
                onValueChange={setRole}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER - Usuario Normal</SelectItem>
                  <SelectItem value="ADMIN">ADMIN - Administrador</SelectItem>
                  <SelectItem value="SUPERADMIN">SUPERADMIN - Super Administrador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {role === "USER" && "Puede ver su propia asistencia"}
                {role === "ADMIN" && "Puede gestionar asistencias y sistema biométrico"}
                {role === "SUPERADMIN" && "Acceso total al sistema"}
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
