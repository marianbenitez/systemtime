"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

interface ImportExcelProps {
  onImportComplete?: () => void
}

export function ImportExcel({ onImportComplete }: ImportExcelProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [open, setOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/attendance/import", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setFile(null)
        if (onImportComplete) {
          onImportComplete()
        }
      } else {
        setResult({ error: data.error })
      }
    } catch (error) {
      setResult({ error: "Error al importar archivo" })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadTemplate = () => {
    const templateContent = `email,fecha,estado,entrada,salida,notas
usuario@ejemplo.com,2024-01-15,PRESENT,2024-01-15T09:00:00,2024-01-15T17:00:00,
usuario2@ejemplo.com,2024-01-15,LATE,2024-01-15T09:30:00,2024-01-15T17:00:00,Llegó tarde
usuario3@ejemplo.com,2024-01-15,ABSENT,,,Ausente sin justificar`

    const blob = new Blob([templateContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plantilla_asistencia.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Importar desde Excel</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Asistencias</DialogTitle>
          <DialogDescription>
            Sube un archivo Excel con los registros de asistencia.
            El archivo debe tener las siguientes columnas: email, fecha, estado, entrada (opcional), salida (opcional), notas (opcional).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Button variant="outline" onClick={downloadTemplate} className="w-full">
              Descargar Plantilla
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Archivo Excel</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>

            {result && (
              <Card>
                <CardContent className="pt-6">
                  {result.error ? (
                    <div className="text-red-600">
                      <p className="font-medium">Error:</p>
                      <p>{result.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-medium text-green-600">{result.message}</p>
                      {result.results?.details && result.results.details.length > 0 && (
                        <div className="mt-2 max-h-40 overflow-y-auto">
                          <p className="font-medium text-sm">Detalles:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {result.results.details.map((detail: string, index: number) => (
                              <li key={index}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={!file || isLoading} className="flex-1">
                {isLoading ? "Importando..." : "Importar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
