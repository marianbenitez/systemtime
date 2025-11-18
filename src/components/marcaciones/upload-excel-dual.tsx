'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function UploadExcelDual() {
  const [archivoSinErrores, setArchivoSinErrores] = useState<File | null>(null)
  const [archivoConErrores, setArchivoConErrores] = useState<File | null>(null)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!archivoSinErrores || !archivoConErrores) {
      setError('Debes seleccionar ambos archivos')
      return
    }

    setLoading(true)
    setError(null)
    setResultado(null)

    try {
      const formData = new FormData()
      formData.append('archivoSinErrores', archivoSinErrores)
      formData.append('archivoConErrores', archivoConErrores)
      formData.append('fechaInicio', fechaInicio)
      formData.append('fechaFin', fechaFin)

      const response = await fetch('/api/marcaciones/importar-dual', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al importar')
      }

      setResultado(data)
      setArchivoSinErrores(null)
      setArchivoConErrores(null)

      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]')
      fileInputs.forEach((input: any) => input.value = '')

    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Importación Dual de Marcaciones</h2>
        <p className="text-sm text-muted-foreground">
          Importa ambos archivos Excel del mismo período para obtener información completa:
          departamentos del archivo SIN ERRORES y análisis de excepciones del archivo CON ERRORES.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Archivo SIN ERRORES */}
        <div className="space-y-2 p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
          <Label htmlFor="sinErrores" className="text-base font-semibold text-green-700 dark:text-green-400">
            1. Archivo SIN ERRORES (Ac Reg del...)
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Este archivo contiene el campo <strong>Departamento/Escuela</strong>
          </p>
          <Input
            id="sinErrores"
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => setArchivoSinErrores(e.target.files?.[0] || null)}
            required
          />
          {archivoSinErrores && (
            <p className="text-xs text-green-600 dark:text-green-400">
              ✓ {archivoSinErrores.name}
            </p>
          )}
        </div>

        {/* Archivo CON ERRORES */}
        <div className="space-y-2 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
          <Label htmlFor="conErrores" className="text-base font-semibold text-blue-700 dark:text-blue-400">
            2. Archivo CON ERRORES (Marcaciones del...)
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Este archivo contiene el análisis de <strong>Excepciones</strong> (FOT, Inválido, Repetido)
          </p>
          <Input
            id="conErrores"
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => setArchivoConErrores(e.target.files?.[0] || null)}
            required
          />
          {archivoConErrores && (
            <p className="text-xs text-blue-600 dark:text-blue-400">
              ✓ {archivoConErrores.name}
            </p>
          )}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="inicio">Fecha Inicio</Label>
            <Input
              id="inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="fin">Fecha Fin</Label>
            <Input
              id="fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !archivoSinErrores || !archivoConErrores}
          className="w-full"
        >
          {loading ? 'Importando...' : 'Importar Ambos Archivos'}
        </Button>
      </form>

      {/* Resultado */}
      {resultado && (
        <Alert className="mt-4 border-green-500 bg-green-50 dark:bg-green-950/20">
          <AlertDescription>
            <p className="font-semibold text-green-700 dark:text-green-400 mb-2">
              {resultado.mensaje}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p><strong>Total Marcaciones:</strong> {resultado.estadisticas.totalMarcaciones}</p>
                <p><strong>Total Empleados:</strong> {resultado.estadisticas.totalEmpleados}</p>
                <p className="text-green-600 dark:text-green-400">
                  <strong>Con Departamento:</strong> {resultado.estadisticas.empleadosConDepartamento}
                </p>
              </div>
              <div>
                <p className="text-green-600 dark:text-green-400">
                  <strong>Válidas (FOT):</strong> {resultado.estadisticas.marcacionesValidas}
                </p>
                <p className="text-yellow-600 dark:text-yellow-400">
                  <strong>Repetidas:</strong> {resultado.estadisticas.marcacionesRepetidas}
                </p>
                <p className="text-red-600 dark:text-red-400">
                  <strong>Inválidas:</strong> {resultado.estadisticas.marcacionesInvalidas}
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert className="mt-4 border-red-500 bg-red-50 dark:bg-red-950/20">
          <AlertDescription className="text-red-700 dark:text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </Card>
  )
}
