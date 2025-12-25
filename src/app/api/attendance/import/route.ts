import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AttendanceStatus } from "@/generated/prisma"
import { canManageAttendance } from "@/lib/role-helpers"
import * as ExcelJS from "exceljs"

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

    // Leer el archivo Excel con ExcelJS
    const bytes = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(bytes)
    
    // Obtener la primera hoja
    const worksheet = workbook.worksheets[0]
    
    // Convertir a JSON similar a xlsx
    const data: any[] = []
    const headerRow = worksheet.getRow(1).values as any[]
    const headers = headerRow.slice(1) // Remover el primer elemento undefined
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // Saltar header
      
      const rowData: any = {}
      const values = row.values as any[]
      
      headers.forEach((header, index) => {
        if (header) {
          rowData[header] = values[index + 1]
        }
      })
      
      data.push(rowData)
    })

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
