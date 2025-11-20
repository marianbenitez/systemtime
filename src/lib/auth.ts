import NextAuth, { type DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Role } from "@/generated/prisma"

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
        console.log("🔑 [AUTH] Iniciando authorize...")
        console.log("📧 [AUTH] Email recibido:", credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          console.error("❌ [AUTH] Credenciales faltantes")
          throw new Error("Credenciales inválidas")
        }

        console.log("🔍 [AUTH] Buscando usuario en base de datos...")
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          }
        })

        if (!user || !user.password) {
          console.error("❌ [AUTH] Usuario no encontrado:", credentials.email)
          throw new Error("Usuario no encontrado")
        }

        console.log("✅ [AUTH] Usuario encontrado:", { id: user.id, email: user.email, role: user.role })

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          console.error("❌ [AUTH] Contraseña incorrecta para:", credentials.email)
          throw new Error("Contraseña incorrecta")
        }

        console.log("✅ [AUTH] Autenticación exitosa para:", user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
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
  secret: process.env.NEXTAUTH_SECRET,
})
