import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { canManageUsers } from "@/lib/role-helpers"

// PUT - Actualizar usuario (solo SUPERADMIN)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    if (!canManageUsers(session.user.role)) {
      return NextResponse.json(
        { error: "No autorizado. Solo SUPERADMIN puede editar usuarios." },
        { status: 403 }
      )
    }

    // Await params en Next.js 16
    const { id } = await params

    const body = await req.json()
    const { email, password, name, role } = body

    // Validaciones
    if (!email || !name || !role) {
      return NextResponse.json(
        { error: "Email, nombre y rol son requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que el email no esté en uso por otro usuario
    if (email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email }
      })

      if (emailInUse) {
        return NextResponse.json(
          { error: "El email ya está en uso por otro usuario" },
          { status: 400 }
        )
      }
    }

    // Preparar datos de actualización
    const updateData: any = {
      email,
      name,
      role
    }

    // Si se proporciona nueva contraseña, hashearla
    if (password && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 6 caracteres" },
          { status: 400 }
        )
      }
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Actualizar usuario
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar usuario (solo SUPERADMIN)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    if (!canManageUsers(session.user.role)) {
      return NextResponse.json(
        { error: "No autorizado. Solo SUPERADMIN puede eliminar usuarios." },
        { status: 403 }
      )
    }

    // Await params en Next.js 16
    const { id } = await params

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // No permitir eliminar el propio usuario
    if (existingUser.id === session.user.id) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propio usuario" },
        { status: 400 }
      )
    }

    // Eliminar usuario (cascade eliminará sus asistencias)
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: "Usuario eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    )
  }
}
