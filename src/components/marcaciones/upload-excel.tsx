'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export function UploadExcel() {
  const [archivoMarcaciones, setArchivoMarcaciones] = useState<File | null>(null)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!archivoMarcaciones || !fechaInicio || !fechaFin) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('archivoMarcaciones', archivoMarcaciones)
      formData.append('fechaInicio', fechaInicio)
      formData.append('fechaFin', fechaFin)

      const response = await fetch('/api/marcaciones/importar', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al importar')
      }

      setResultado(data)
      alert('Importación exitosa!')

      setArchivoMarcaciones(null)
      setFechaInicio('')
      setFechaFin('')

    } catch (error) {
      console.error('Error:', error)
      alert('Error al importar: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Importar Marcaciones Biométricas</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="archivo">Archivo de Marcaciones *</Label>
          <Input
            id="archivo"
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => setArchivoMarcaciones(e.target.files?.[0] || null)}
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Suba el archivo Excel exportado desde el reloj biométrico
          </p>
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

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Procesando...' : 'Importar Marcaciones'}
        </Button>
      </form>

      {resultado && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">
            Importación Exitosa
          </h3>
          <p className="text-sm text-green-700">
            {resultado.mensaje}
          </p>
          <div className="mt-2 text-xs text-green-600">
            <p>Registros válidos: {resultado.importacion.registrosValidos}</p>
            <p>Registros inválidos: {resultado.importacion.registrosInvalidos}</p>
          </div>
        </div>
      )}
    </Card>
  )
}
