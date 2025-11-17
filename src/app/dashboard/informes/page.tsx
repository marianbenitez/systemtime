import { GeneradorPDF } from '@/components/informes/generador-pdf'

export default function InformesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Generar Informes</h1>

      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="font-semibold text-amber-900 mb-2">📄 Tipos de Informes</h3>
        <div className="space-y-2 text-sm text-amber-800">
          <div>
            <strong>Modo Tolerante:</strong> Calcula horas incluso cuando hay errores de marcación.
            Asume 8 horas cuando falta una entrada o salida.
          </div>
          <div>
            <strong>Modo Estricto:</strong> Solo cuenta días sin errores. Si hay algún problema
            en las marcaciones de un día, ese día aparecerá con 0 horas trabajadas.
          </div>
        </div>
      </div>

      <GeneradorPDF />
    </div>
  )
}
