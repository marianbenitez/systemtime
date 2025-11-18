import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AttendanceStatus } from "@/generated/prisma"
import { canManageAttendance } from "@/lib/role-helpers"
import * as XLSX from "xlsx"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Verificar que el usuario tenga permisos para gestionar asistencias
    if (!canManageAttendance(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos para importar asistencias" },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      )
    }

    // Leer el archivo Excel
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet)

    const results = {
      success: 0,
      errors: 0,
      details: [] as string[]
    }

    // Procesar cada fila
    for (let i = 0; i < data.length; i++) {
      const row: any = data[i]

      try {
        // Validar campos requeridos
        if (!row.email || !row.fecha || !row.estado) {
          results.errors++
          results.details.push(`Fila ${i + 2}: Faltan campos requeridos (email, fecha, estado)`)
          continue
        }

        // Buscar usuario por email
        const user = await prisma.user.findUnique({
          where: { email: row.email }
        })

        if (!user) {
          results.errors++
          results.details.push(`Fila ${i + 2}: Usuario con email ${row.email} no encontrado`)
          continue
        }

        // Validar estado
        const status = row.estado.toUpperCase()
        if (!Object.values(AttendanceStatus).includes(status as AttendanceStatus)) {
          results.errors++
          results.details.push(`Fila ${i + 2}: Estado inválido '${row.estado}'. Use: PRESENT, ABSENT, LATE, JUSTIFIED`)
          continue
        }

        // Crear registro de asistencia
        await prisma.attendance.create({
          data: {
            userId: user.id,
            date: new Date(row.fecha),
            status: status as AttendanceStatus,
            checkIn: row.entrada ? new Date(row.entrada) : null,
            checkOut: row.salida ? new Date(row.salida) : null,
            notes: row.notas || null,
          }
        })

        results.success++
      } catch (error) {
        results.errors++
        results.details.push(`Fila ${i + 2}: Error al procesar - ${error}`)
      }
    }

    return NextResponse.json({
      message: `Importación completada. ${results.success} registros exitosos, ${results.errors} errores.`,
      results
    })
  } catch (error) {
    console.error("Error en importación:", error)
    return NextResponse.json(
      { error: "Error al importar archivo" },
      { status: 500 }
    )
  }
}
