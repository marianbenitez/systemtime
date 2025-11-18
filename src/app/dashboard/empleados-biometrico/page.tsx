'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function EmpleadosBiometricoPage() {
  const [empleados, setEmpleados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/empleados')
      .then(res => res.json())
      .then(data => {
        const empleadosData = Array.isArray(data) ? data : []
        setEmpleados(empleadosData)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setEmpleados([])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Empleados (Sistema Biométrico)</h1>

      <Card className="p-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Total de empleados: <span className="font-bold">{Array.isArray(empleados) ? empleados.length : 0}</span>
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DNI (Nº AC)</TableHead>
              <TableHead>Legajo (Nº ID)</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Escuela</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!Array.isArray(empleados) || empleados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay empleados registrados. Importe marcaciones para crear empleados automáticamente.
                </TableCell>
              </TableRow>
            ) : (
              empleados.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.numeroAC}</TableCell>
                  <TableCell>{emp.numeroId || '-'}</TableCell>
                  <TableCell className="font-medium">{emp.apellido}</TableCell>
                  <TableCell>{emp.nombre}</TableCell>
                  <TableCell>{emp.departamento || '-'}</TableCell>
                  <TableCell>
                    {emp.activo ? (
                      <Badge variant="default">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
