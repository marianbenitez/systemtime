"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"

export function useCurrentUser() {
  const { data: session, status } = useSession()

  useEffect(() => {
    console.log("👥 [USE-CURRENT-USER] Hook ejecutado")
    console.log("📊 [USE-CURRENT-USER] Status:", status)
    console.log("👤 [USE-CURRENT-USER] Session:", session)
    console.log("✅ [USE-CURRENT-USER] Authenticated:", status === "authenticated")
  }, [session, status])

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  }
}
