import NextAuth, { type DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Role } from "@/generated/prisma"

// Validar que AUTH_SECRET o NEXTAUTH_SECRET esté configurado
// AUTH_SECRET es para Auth.js v5+, NEXTAUTH_SECRET es para NextAuth.js v4
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

if (!authSecret) {
  throw new Error(
    "❌ AUTH_SECRET no está configurado. " +
    "En desarrollo: crea .env.local con AUTH_SECRET=tu_secreto_aqui. " +
    "En producción: configura AUTH_SECRET en las variables de entorno del servidor. " +
    "Genera un secreto con: npx auth secret"
  )
}

// Asegurar que AUTH_SECRET esté disponible para next-auth
if (!process.env.AUTH_SECRET && process.env.NEXTAUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET
}

// Configurar AUTH_URL si NEXTAUTH_URL está disponible (para compatibilidad)
// NextAuth v5 usa AUTH_URL, pero también acepta NEXTAUTH_URL
if (process.env.NEXTAUTH_URL && !process.env.AUTH_URL) {
  process.env.AUTH_URL = process.env.NEXTAUTH_URL
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    name: string
    role: Role
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: Role
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("🔑 [AUTH] Iniciando authorize...")
          console.log("📧 [AUTH] Email recibido:", credentials?.email)

          if (!credentials?.email || !credentials?.password) {
            console.error("❌ [AUTH] Credenciales faltantes")
            return null
          }

          console.log("🔍 [AUTH] Buscando usuario en base de datos...")
          
          // Función para buscar usuario con reintentos (cold start de Neon)
          const findUserWithRetry = async (email: string, maxRetries = 3) => {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
              try {
                console.log(`🔄 [AUTH] Intento ${attempt}/${maxRetries} de conexión a BD...`)
                const result = await prisma.user.findUnique({
                  where: { email }
                })
                console.log(`✅ [AUTH] Conexión exitosa en intento ${attempt}`)
                return result
              } catch (dbError) {
                console.error(`❌ [AUTH] Error en intento ${attempt}:`, dbError)
                if (attempt === maxRetries) {
                  throw dbError
                }
                // Esperar antes de reintentar (1s, 2s, 3s)
                const waitTime = attempt * 1000
                console.log(`⏳ [AUTH] Esperando ${waitTime}ms antes de reintentar...`)
                await new Promise(resolve => setTimeout(resolve, waitTime))
              }
            }
            return null
          }

          let user
          try {
            user = await findUserWithRetry(credentials.email as string)
          } catch (dbError) {
            console.error("❌ [AUTH] Error de base de datos después de reintentos:", dbError)
            return null
          }

          if (!user || !user.password) {
            console.error("❌ [AUTH] Usuario no encontrado:", credentials.email)
            return null
          }

          console.log("✅ [AUTH] Usuario encontrado:", { id: user.id, email: user.email, role: user.role })

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            console.error("❌ [AUTH] Contraseña incorrecta para:", credentials.email)
            return null
          }

          console.log("✅ [AUTH] Autenticación exitosa para:", user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error("❌ [AUTH] Error inesperado en authorize:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("🎫 [JWT] Callback ejecutado")
      if (user) {
        console.log("👤 [JWT] Usuario encontrado, agregando a token:", { id: user.id, email: user.email, role: user.role })
        token.id = user.id
        token.role = user.role
      } else {
        console.log("🔄 [JWT] Token existente, sin usuario nuevo")
      }
      console.log("📦 [JWT] Token final:", { id: token.id, role: token.role, email: token.email })
      return token
    },
    async session({ session, token }) {
      console.log("📋 [SESSION] Callback ejecutado")
      console.log("🎫 [SESSION] Token recibido:", { id: token.id, role: token.role })
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        console.log("✅ [SESSION] Sesión actualizada:", {
          userId: session.user.id,
          userEmail: session.user.email,
          userRole: session.user.role
        })
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log("🚀 [REDIRECT] Callback ejecutado")
      console.log("📍 [REDIRECT] URL solicitada:", url)
      console.log("🏠 [REDIRECT] Base URL:", baseUrl)

      // Siempre devolver rutas relativas para evitar 307 en Vercel
      if (url.startsWith("/")) {
        console.log("✅ [REDIRECT] Ruta relativa, usando:", url)
        return url
      }

      if (url.startsWith(baseUrl)) {
        const path = url.replace(baseUrl, "")
        console.log("✅ [REDIRECT] Extrayendo path de URL absoluta:", path)
        return path || "/dashboard"
      }

      console.log("⚠️ [REDIRECT] Por defecto, redirigiendo a /dashboard")
      return "/dashboard"
    }
  },
})
