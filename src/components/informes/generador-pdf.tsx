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
  nombre: string
}

export function GeneradorPDF() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [empleadoId, setEmpleadoId] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [modo, setModo] = useState<'tolerante' | 'estricto'>('tolerante')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/empleados')
      .then(res => res.json())
      .then(setEmpleados)
  }, [])

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
        <div>
          <Label htmlFor="empleado">Empleado *</Label>
          <Select value={empleadoId} onValueChange={setEmpleadoId} required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar empleado" />
            </SelectTrigger>
            <SelectContent>
              {empleados.map(emp => (
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.nombre} ({emp.numeroAC})
                </SelectItem>
              ))}
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
