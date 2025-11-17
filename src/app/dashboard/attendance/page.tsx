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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImportExcel } from "@/components/dashboard/import-excel"

interface Attendance {
  id: string
  date: string
  status: string
  checkIn: string | null
  checkOut: string | null
  notes: string | null
  user: {
    id: string
    name: string
    email: string
  }
}

export default function AttendanceManagementPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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

  const filteredAttendances = attendances.filter((attendance) =>
    attendance.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendance.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Asistencia</h1>
          <p className="text-gray-500">
            Administra la asistencia de todos los usuarios
          </p>
        </div>
        <div className="flex gap-2">
          <ImportExcel onImportComplete={fetchAttendances} />
          <Button>Registrar Asistencia</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Asistencias</CardTitle>
          <CardDescription>
            Lista completa de registros de asistencia
          </CardDescription>
          <div className="pt-4">
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredAttendances.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay registros de asistencia
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendances.map((attendance) => (
                  <TableRow key={attendance.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{attendance.user.name}</div>
                        <div className="text-sm text-gray-500">{attendance.user.email}</div>
                      </div>
                    </TableCell>
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
