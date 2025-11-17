import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatearFecha(fecha: Date | string): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha
  return format(d, 'dd/MM/yyyy')
}

export function formatearHora(hora: Date | string): string {
  const h = typeof hora === 'string' ? new Date(hora) : hora
  return format(h, 'HH:mm')
}

export function formatearHorasDecimal(horas: number): string {
  return horas.toFixed(2)
}

export function parsearFechaExcel(fechaString: string): Date | null {
  try {
    // Formato esperado: "14/5/2025 08:04" o "14/05/2025 08:04"
    const [fecha, hora] = fechaString.split(' ')
    const [dia, mes, año] = fecha.split('/')
    const [hh, mm] = hora.split(':')

    return new Date(
      parseInt(año),
      parseInt(mes) - 1,
      parseInt(dia),
      parseInt(hh),
      parseInt(mm)
    )
  } catch (error) {
    console.error('Error parseando fecha:', fechaString, error)
    return null
  }
}
