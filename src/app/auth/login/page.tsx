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
      origin: window.location.origin,
      isProduction: process.env.NODE_ENV === 'production',
      nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET'
    })

    try {
      console.log("🔄 [LOGIN] Llamando a signIn con opciones mínimas...")

      // Usar solo las opciones mínimas necesarias - redirect debe ser literal
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false as const
      })

      console.log("📊 [LOGIN] SignIn result completo:", JSON.stringify(result, null, 2))

      if (result?.error) {
        console.error("❌ [LOGIN] Error en signIn:", result.error)
        console.error("📝 [LOGIN] Tipo de error:", typeof result.error)
        
        // Manejar diferentes tipos de error
        let errorMessage = "Error al iniciar sesión"
        if (result.error === "CredentialsSignin") {
          errorMessage = "Credenciales inválidas. Verifica tu email y contraseña."
        } else if (result.error === "Configuration") {
          errorMessage = "Error de configuración del servidor. Contacta al administrador."
        }
        setError(errorMessage)
      } else if (result?.ok) {
        console.log("✅ [LOGIN] Login exitoso!")
        console.log("🚀 [LOGIN] Verificando sesión antes de redirigir...")

        // Verificar que la sesión se creó correctamente
        const sessionCheck = await fetch('/api/auth/session')
        const sessionData = await sessionCheck.json()
        
        console.log("📋 [LOGIN] Sesión verificada:", sessionData)
        
        if (sessionData?.user) {
          console.log("✅ [LOGIN] Sesión confirmada, redirigiendo...")
          window.location.replace("/dashboard")
        } else {
          console.log("⚠️ [LOGIN] Sesión no detectada, reintentando...")
          // Esperar un momento y reintentar
          await new Promise(resolve => setTimeout(resolve, 500))
          window.location.replace("/dashboard")
        }
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
