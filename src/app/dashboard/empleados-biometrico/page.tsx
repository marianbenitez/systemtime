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
        setEmpleados(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
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
            Total de empleados: <span className="font-bold">{empleados.length}</span>
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Legajo (Nº AC)</TableHead>
              <TableHead>Nº Empleado</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empleados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay empleados registrados. Importe marcaciones para crear empleados automáticamente.
                </TableCell>
              </TableRow>
            ) : (
              empleados.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.numeroAC}</TableCell>
                  <TableCell>{emp.numeroEmpleado || '-'}</TableCell>
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
