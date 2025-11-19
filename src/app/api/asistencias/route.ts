import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canViewAllAttendance } from "@/lib/role-helpers"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Verificar permisos
    if (!canViewAllAttendance(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos para ver asistencias" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const empleadoId = searchParams.get("empleadoId")
    const fechaInicio = searchParams.get("fechaInicio")
    const fechaFin = searchParams.get("fechaFin")
    const limit = parseInt(searchParams.get("limit") || "100")

    const where: any = {}

    if (empleadoId) {
      where.empleadoId = parseInt(empleadoId)
    }

    if (fechaInicio) {
      where.fecha = {
        ...where.fecha,
        gte: new Date(fechaInicio)
      }
    }

    if (fechaFin) {
      where.fecha = {
        ...where.fecha,
        lte: new Date(fechaFin)
      }
    }

    const asistencias = await prisma.asistenciaDiaria.findMany({
      where,
      include: {
        empleado: {
          select: {
            id: true,
            numeroAC: true,
            numeroId: true,
            nombre: true,
            apellido: true,
            departamento: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      },
      take: limit
    })

    return NextResponse.json({ asistencias })
  } catch (error) {
    console.error("Error al obtener asistencias:", error)
    return NextResponse.json(
      { error: "Error al obtener asistencias" },
      { status: 500 }
    )
  }
}
