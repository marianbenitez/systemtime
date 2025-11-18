import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { prisma } from '@/lib/prisma'
import { formatearFecha, formatearHora } from '@/lib/utils'
import { startOfDay } from 'date-fns'

interface GenerarInformeOptions {
  empleadoId: number
  fechaInicio: Date
  fechaFin: Date
  modo: 'tolerante' | 'estricto'
}

export async function generarInformePDF(
  options: GenerarInformeOptions
): Promise<{ buffer: ArrayBuffer; nombreArchivo: string }> {
  const { empleadoId, fechaInicio, fechaFin, modo } = options

  const empleado = await prisma.empleado.findUnique({
    where: { id: empleadoId }
  })

  if (!empleado) {
    throw new Error('Empleado no encontrado')
  }

  const asistencias = await prisma.asistenciaDiaria.findMany({
    where: {
      empleadoId,
      fecha: {
        gte: startOfDay(fechaInicio),
        lte: startOfDay(fechaFin)
      }
    },
    orderBy: { fecha: 'asc' }
  })

  const asistenciasFiltradas = asistencias

  const diasTrabajados = asistenciasFiltradas.filter(a =>
    modo === 'estricto' ? !a.tieneErrores : Number(a.horasTrabajadas) > 0
  ).length

  const totalHoras = asistenciasFiltradas.reduce((sum, a) =>
    sum + (modo === 'estricto' && a.tieneErrores ? 0 : Number(a.horasTrabajadas)),
    0
  )

  const doc = new jsPDF()

  // Encabezado
  doc.setFontSize(16)
  doc.text('INFORME DE ASISTENCIA', 105, 20, { align: 'center' })
  doc.setFontSize(12)
  doc.text(`Modo: ${modo === 'tolerante' ? 'TOLERANTE' : 'ESTRICTO'}`, 105, 28, { align: 'center' })

  doc.setFontSize(10)
  doc.text(`Empleado: ${empleado.nombre}`, 20, 40)
  doc.text(`Legajo: ${empleado.numeroAC}`, 20, 46)
  doc.text(`Período: ${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`, 20, 52)

  // Tabla
  const tableData = asistenciasFiltradas.map(a => {
    const fila = [
      formatearFecha(a.fecha),
      a.entrada1 ? formatearHora(new Date(a.entrada1)) : '-',
      a.salida1 ? formatearHora(new Date(a.salida1)) : '-',
      a.entrada2 ? formatearHora(new Date(a.entrada2)) : '-',
      a.salida2 ? formatearHora(new Date(a.salida2)) : '-',
      a.entrada3 ? formatearHora(new Date(a.entrada3)) : '-',
      a.salida3 ? formatearHora(new Date(a.salida3)) : '-',
      (modo === 'estricto' && a.tieneErrores ? '0.00' : Number(a.horasTrabajadas).toFixed(2))
    ]

    if (modo === 'estricto') {
      fila.push(a.tieneErrores ? (a.tipoError || 'Error') : 'OK')
    }

    return fila
  })

  const headers = modo === 'estricto'
    ? ['Fecha', 'E1', 'S1', 'E2', 'S2', 'E3', 'S3', 'Horas', 'Observaciones']
    : ['Fecha', 'E1', 'S1', 'E2', 'S2', 'E3', 'S3', 'Horas']

  autoTable(doc, {
    startY: 60,
    head: [headers],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 25 },
      7: { halign: 'right' }
    }
  })

  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`TOTAL DÍAS TRABAJADOS: ${diasTrabajados}`, 20, finalY)
  doc.text(`TOTAL HORAS: ${totalHoras.toFixed(2)}`, 20, finalY + 6)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Generado: ${new Date().toLocaleString('es-AR')}`,
    105,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  )

  const nombreArchivo = `informe_${empleado.numeroAC}_${formatearFecha(fechaInicio)}_${modo}.pdf`

  await prisma.informe.create({
    data: {
      empleadoId,
      tipoInforme: modo,
      fechaInicio: startOfDay(fechaInicio),
      fechaFin: startOfDay(fechaFin),
      archivoPath: `/informes/${nombreArchivo}`,
      totalDiasTrabajados: diasTrabajados,
      totalHoras
    }
  })

  return {
    buffer: doc.output('arraybuffer'),
    nombreArchivo
  }
}
