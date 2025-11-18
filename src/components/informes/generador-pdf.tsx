'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'

interface Empleado {
  id: number
  numeroAC: string
  numeroId?: string
  nombre: string
  apellido: string
  departamento?: string
}

export function GeneradorPDF() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState<Empleado[]>([])
  const [empleadoId, setEmpleadoId] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [modo, setModo] = useState<'tolerante' | 'estricto'>('tolerante')
  const [loading, setLoading] = useState(false)

  // Filtros de búsqueda
  const [filtroDNI, setFiltroDNI] = useState('')
  const [filtroLegajo, setFiltroLegajo] = useState('')
  const [filtroApellido, setFiltroApellido] = useState('')
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroEscuela, setFiltroEscuela] = useState('')

  useEffect(() => {
    fetch('/api/empleados')
      .then(res => res.json())
      .then(data => {
        const empleadosData = Array.isArray(data) ? data : []
        setEmpleados(empleadosData)
        setEmpleadosFiltrados(empleadosData)
      })
      .catch(error => {
        console.error('Error al cargar empleados:', error)
        setEmpleados([])
        setEmpleadosFiltrados([])
      })
  }, [])

  // Aplicar filtros
  useEffect(() => {
    if (!Array.isArray(empleados)) {
      setEmpleadosFiltrados([])
      return
    }

    let resultados = [...empleados]

    if (filtroDNI) {
      resultados = resultados.filter(emp =>
        emp.numeroAC?.toLowerCase().includes(filtroDNI.toLowerCase())
      )
    }

    if (filtroLegajo) {
      resultados = resultados.filter(emp =>
        emp.numeroId?.toLowerCase().includes(filtroLegajo.toLowerCase())
      )
    }

    if (filtroApellido) {
      resultados = resultados.filter(emp =>
        emp.apellido?.toLowerCase().includes(filtroApellido.toLowerCase())
      )
    }

    if (filtroNombre) {
      resultados = resultados.filter(emp =>
        emp.nombre?.toLowerCase().includes(filtroNombre.toLowerCase())
      )
    }

    if (filtroEscuela) {
      resultados = resultados.filter(emp =>
        emp.departamento?.toLowerCase().includes(filtroEscuela.toLowerCase())
      )
    }

    setEmpleadosFiltrados(resultados)
  }, [empleados, filtroDNI, filtroLegajo, filtroApellido, filtroNombre, filtroEscuela])

  const limpiarFiltros = () => {
    setFiltroDNI('')
    setFiltroLegajo('')
    setFiltroApellido('')
    setFiltroNombre('')
    setFiltroEscuela('')
  }

  const handleGenerar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/informes/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleadoId,
          fechaInicio,
          fechaFin,
          modo
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      window.open(data.url, '_blank')
      alert('Informe generado exitosamente!')

    } catch (error) {
      alert('Error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Generar Informe PDF</h2>

      <form onSubmit={handleGenerar} className="space-y-4">
        {/* Filtros de búsqueda */}
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-semibold">Filtrar Empleados</Label>
            {(filtroDNI || filtroLegajo || filtroApellido || filtroNombre || filtroEscuela) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={limpiarFiltros}
                className="h-7 text-xs"
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="filtroDNI" className="text-xs text-muted-foreground">
                DNI
              </Label>
              <Input
                id="filtroDNI"
                placeholder="Buscar por DNI..."
                value={filtroDNI}
                onChange={(e) => setFiltroDNI(e.target.value)}
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="filtroLegajo" className="text-xs text-muted-foreground">
                Legajo
              </Label>
              <Input
                id="filtroLegajo"
                placeholder="Buscar por legajo..."
                value={filtroLegajo}
                onChange={(e) => setFiltroLegajo(e.target.value)}
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="filtroApellido" className="text-xs text-muted-foreground">
                Apellido
              </Label>
              <Input
                id="filtroApellido"
                placeholder="Buscar por apellido..."
                value={filtroApellido}
                onChange={(e) => setFiltroApellido(e.target.value)}
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="filtroNombre" className="text-xs text-muted-foreground">
                Nombre
              </Label>
              <Input
                id="filtroNombre"
                placeholder="Buscar por nombre..."
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="filtroEscuela" className="text-xs text-muted-foreground">
                Escuela
              </Label>
              <Input
                id="filtroEscuela"
                placeholder="Buscar por escuela..."
                value={filtroEscuela}
                onChange={(e) => setFiltroEscuela(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Mostrando {Array.isArray(empleadosFiltrados) ? empleadosFiltrados.length : 0} de {Array.isArray(empleados) ? empleados.length : 0} empleado(s)
          </p>
        </div>

        {/* Selector de empleado */}
        <div>
          <Label htmlFor="empleado">Empleado *</Label>
          <Select value={empleadoId} onValueChange={setEmpleadoId} required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar empleado" />
            </SelectTrigger>
            <SelectContent>
              {!Array.isArray(empleadosFiltrados) || empleadosFiltrados.length === 0 ? (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  No se encontraron empleados
                </div>
              ) : (
                empleadosFiltrados.map(emp => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.apellido}, {emp.nombre} - DNI: {emp.numeroAC}
                    {emp.numeroId && ` - Legajo: ${emp.numeroId}`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="inicio">Fecha Inicio *</Label>
            <Input
              id="inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="fin">Fecha Fin *</Label>
            <Input
              id="fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="modo">Modo de Informe *</Label>
          <Select value={modo} onValueChange={(v: any) => setModo(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tolerante">Tolerante</SelectItem>
              <SelectItem value="estricto">Estricto</SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">
              {modo === 'tolerante' ? '📊 Modo Tolerante' : '📋 Modo Estricto'}
            </p>
            <p className="text-xs text-muted-foreground">
              {modo === 'tolerante'
                ? 'Intenta calcular horas incluso con errores. Asume 8 horas cuando falta entrada o salida.'
                : 'Solo cuenta días sin errores. Si hay algún error en las marcaciones, ese día no suma horas.'}
            </p>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Generando...' : 'Generar PDF'}
        </Button>
      </form>
    </Card>
  )
}
