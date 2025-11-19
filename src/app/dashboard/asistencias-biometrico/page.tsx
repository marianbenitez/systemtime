'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AsistenciaDiaria {
  id: number
  fecha: string
  entrada1: string | null
  salida1: string | null
  entrada2: string | null
  salida2: string | null
  entrada3: string | null
  salida3: string | null
  horasTrabajadas: number
  tieneErrores: boolean
  tipoError: string | null
  observaciones: string | null
  empleado: {
    id: number
    numeroAC: string
    numeroId: string | null
    nombre: string
    apellido: string
    departamento: string | null
  }
}

export default function AsistenciasBiometricoPage() {
  const [asistencias, setAsistencias] = useState<AsistenciaDiaria[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterErrores, setFilterErrores] = useState<string>('todos')

  useEffect(() => {
    fetchAsistencias()
  }, [])

  const fetchAsistencias = async () => {
    try {
      const response = await fetch('/api/asistencias?limit=200')
      if (response.ok) {
        const data = await response.json()
        setAsistencias(data.asistencias || [])
      }
    } catch (error) {
      console.error('Error al cargar asistencias:', error)
      setAsistencias([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredAsistencias = asistencias.filter((asistencia) => {
    const matchesSearch =
      asistencia.empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asistencia.empleado.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asistencia.empleado.numeroAC.includes(searchTerm)

    const matchesFilter =
      filterErrores === 'todos' ||
      (filterErrores === 'con-errores' && asistencia.tieneErrores) ||
      (filterErrores === 'sin-errores' && !asistencia.tieneErrores)

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando asistencias...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Asistencias Diarias (Sistema Biométrico)</h1>
        <p className="text-gray-500 mt-2">
          Visualización de marcaciones procesadas del sistema biométrico
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Asistencias Procesadas</CardTitle>
          <CardDescription>
            Total de registros: {filteredAsistencias.length} de {asistencias.length}
          </CardDescription>
          <div className="flex gap-4 pt-4">
            <Input
              placeholder="Buscar por nombre, apellido o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterErrores} onValueChange={setFilterErrores}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por errores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sin-errores">Sin errores</SelectItem>
                <SelectItem value="con-errores">Con errores</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchAsistencias} variant="outline">
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAsistencias.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {asistencias.length === 0
                ? 'No hay asistencias procesadas. Importe marcaciones desde la página de Marcaciones.'
                : 'No se encontraron resultados con los filtros aplicados.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Entrada 1</TableHead>
                    <TableHead>Salida 1</TableHead>
                    <TableHead>Entrada 2</TableHead>
                    <TableHead>Salida 2</TableHead>
                    <TableHead>Entrada 3</TableHead>
                    <TableHead>Salida 3</TableHead>
                    <TableHead className="text-right">Horas</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAsistencias.map((asistencia) => (
                    <TableRow key={asistencia.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {asistencia.empleado.apellido}, {asistencia.empleado.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {asistencia.empleado.departamento || 'Sin escuela'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {asistencia.empleado.numeroAC}
                      </TableCell>
                      <TableCell>{formatDate(asistencia.fecha)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTime(asistencia.entrada1)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTime(asistencia.salida1)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTime(asistencia.entrada2)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTime(asistencia.salida2)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTime(asistencia.entrada3)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTime(asistencia.salida3)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {parseFloat(asistencia.horasTrabajadas.toString()).toFixed(2)}h
                      </TableCell>
                      <TableCell>
                        {asistencia.tieneErrores ? (
                          <Badge variant="destructive" className="whitespace-nowrap">
                            Error: {asistencia.tipoError}
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-500 whitespace-nowrap">
                            ✓ OK
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {asistencias.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-sm text-gray-500">Total Asistencias</div>
                <div className="text-2xl font-bold">{asistencias.length}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-gray-500">Sin Errores</div>
                <div className="text-2xl font-bold text-green-600">
                  {asistencias.filter(a => !a.tieneErrores).length}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-gray-500">Con Errores</div>
                <div className="text-2xl font-bold text-red-600">
                  {asistencias.filter(a => a.tieneErrores).length}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-gray-500">Horas Totales</div>
                <div className="text-2xl font-bold">
                  {asistencias.reduce((acc, a) => acc + parseFloat(a.horasTrabajadas.toString()), 0).toFixed(2)}h
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
