import { UploadExcel } from '@/components/marcaciones/upload-excel'

export default function MarcacionesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Importar Marcaciones Biométricas</h1>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Acerca de este módulo</h3>
        <p className="text-sm text-blue-800">
          Este sistema procesa archivos Excel exportados desde relojes biométricos.
          El sistema detecta automáticamente 5 tipos de errores de marcación, calcula horas trabajadas
          y genera resúmenes mensuales para cada empleado.
        </p>
      </div>
      <UploadExcel />
    </div>
  )
}
