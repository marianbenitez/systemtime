"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Attendance {
  id: string
  date: string
  status: string
  checkIn: string | null
  checkOut: string | null
  notes: string | null
}

export default function MyAttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAttendances()
  }, [])

  const fetchAttendances = async () => {
    try {
      const response = await fetch("/api/attendance")
      if (response.ok) {
        const data = await response.json()
        setAttendances(data.attendances)
      }
    } catch (error) {
      console.error("Error al cargar asistencias:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      PRESENT: "bg-green-500",
      ABSENT: "bg-red-500",
      LATE: "bg-yellow-500",
      JUSTIFIED: "bg-blue-500",
    }

    const statusLabels: { [key: string]: string } = {
      PRESENT: "Presente",
      ABSENT: "Ausente",
      LATE: "Tarde",
      JUSTIFIED: "Justificado",
    }

    return (
      <Badge className={statusColors[status]}>
        {statusLabels[status] || status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Asistencia</h1>
        <p className="text-gray-500">
          Visualiza tu historial de asistencia
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Asistencia</CardTitle>
          <CardDescription>
            Lista completa de tus registros de asistencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendances.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay registros de asistencia
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendances.map((attendance) => (
                  <TableRow key={attendance.id}>
                    <TableCell>{formatDate(attendance.date)}</TableCell>
                    <TableCell>{getStatusBadge(attendance.status)}</TableCell>
                    <TableCell>{formatTime(attendance.checkIn)}</TableCell>
                    <TableCell>{formatTime(attendance.checkOut)}</TableCell>
                    <TableCell>{attendance.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
