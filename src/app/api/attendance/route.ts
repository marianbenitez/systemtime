import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AttendanceStatus } from "@/generated/prisma"
import { canViewAllAttendance } from "@/lib/role-helpers"

// GET - Obtener asistencias
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Si no es admin/superadmin, solo puede ver sus propias asistencias
    const canViewAll = canViewAllAttendance(session.user.role)

    const where: any = {}

    if (userId && canViewAll) {
      where.userId = userId
    } else if (!canViewAll) {
      where.userId = session.user.id
    }

    if (startDate) {
      where.date = {
        ...where.date,
        gte: new Date(startDate)
      }
    }

    if (endDate) {
      where.date = {
        ...where.date,
        lte: new Date(endDate)
      }
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({ attendances })
  } catch (error) {
    console.error("Error al obtener asistencias:", error)
    return NextResponse.json(
      { error: "Error al obtener asistencias" },
      { status: 500 }
    )
  }
}

// POST - Crear asistencia
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, date, status, checkIn, checkOut, notes } = body

    if (!date || !status) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el status sea válido
    if (!Object.values(AttendanceStatus).includes(status)) {
      return NextResponse.json(
        { error: "Estado de asistencia inválido" },
        { status: 400 }
      )
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId: userId || session.user.id,
        date: new Date(date),
        status,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({ attendance }, { status: 201 })
  } catch (error) {
    console.error("Error al crear asistencia:", error)
    return NextResponse.json(
      { error: "Error al crear asistencia" },
      { status: 500 }
    )
  }
}
