"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Redirigir a dashboard si ya está autenticado
  useEffect(() => {
    console.log("🔐 [LOGIN-PAGE] Verificando sesión existente...")
    console.log("📊 [LOGIN-PAGE] Status:", status)
    console.log("📊 [LOGIN-PAGE] Session:", session)

    if (status === "authenticated" && session?.user) {
      console.log("✅ [LOGIN-PAGE] Ya autenticado, redirigiendo a dashboard")
      router.push("/dashboard")
      router.refresh()
    }
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    console.log("🔐 [LOGIN] Iniciando proceso de login...")
    console.log("📧 [LOGIN] Email:", email)
    console.log("🌍 [LOGIN] Environment:", {
      hostname: window.location.hostname,
      href: window.location.href,
      origin: window.location.origin
    })

    try {
      console.log("🔄 [LOGIN] Llamando a signIn...")
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      })

      console.log("📊 [LOGIN] SignIn result completo:", JSON.stringify(result, null, 2))

      if (result?.error) {
        console.error("❌ [LOGIN] Error en signIn:", result.error)
        console.error("📝 [LOGIN] Tipo de error:", typeof result.error)
        setError(result.error === "CredentialsSignin"
          ? "Credenciales inválidas"
          : result.error)
      } else if (result?.ok) {
        console.log("✅ [LOGIN] Login exitoso!")
        console.log("🔄 [LOGIN] Estado del resultado:", {
          ok: result.ok,
          status: result.status,
          url: result.url,
          error: result.error
        })
        console.log("🚀 [LOGIN] Redirigiendo a /dashboard...")

        // Pequeño delay para asegurar que la sesión se actualizó
        await new Promise(resolve => setTimeout(resolve, 100))

        // Usar window.location para asegurar limpieza completa del estado
        window.location.href = "/dashboard"
      } else {
        console.error("⚠️ [LOGIN] Resultado inesperado:", result)
        setError("Error desconocido al iniciar sesión")
      }
    } catch (error) {
      console.error("💥 [LOGIN] Excepción capturada:", error)
      console.error("📋 [LOGIN] Detalles del error:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
      console.log("🏁 [LOGIN] Proceso de login finalizado")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cargando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
