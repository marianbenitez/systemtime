import { UploadExcelDual } from '@/components/marcaciones/upload-excel-dual'

export default function MarcacionesDualPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Importación Dual de Marcaciones</h1>
        <p className="text-muted-foreground">
          Importa ambos archivos Excel del mismo período para combinar departamentos y análisis de errores.
        </p>
      </div>

      <div className="grid gap-6">
        <UploadExcelDual />

        <div className="bg-muted/50 p-6 rounded-lg space-y-4">
          <h3 className="font-semibold text-lg">¿Cómo funciona la importación dual?</h3>

          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <p className="font-semibold">Archivo SIN ERRORES (Ac Reg del...)</p>
                <p className="text-muted-foreground">
                  Se extraen los <strong>departamentos/escuelas</strong> de cada empleado.
                  Este archivo contiene todas las marcaciones válidas con información completa de ubicación.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <p className="font-semibold">Archivo CON ERRORES (Marcaciones del...)</p>
                <p className="text-muted-foreground">
                  Se obtienen las marcaciones con <strong>análisis de excepciones</strong>:
                  FOT (válidas), Inválido (rechazadas), y Repetido (duplicadas).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <p className="font-semibold">Fusión y Procesamiento</p>
                <p className="text-muted-foreground">
                  El sistema fusiona ambos archivos, enriqueciendo las marcaciones CON ERRORES
                  con los departamentos del archivo SIN ERRORES, creando un conjunto de datos completo.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <p className="font-semibold">Cálculo de Asistencia con 3 Turnos</p>
                <p className="text-muted-foreground">
                  Se procesan las marcaciones detectando errores (entrada sin salida, salida sin entrada, repetidos, inválidos)
                  y se arman pares de entrada/salida para hasta <strong>3 turnos diarios</strong> por empleado.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-900">
          <h3 className="font-semibold text-lg mb-2 text-yellow-800 dark:text-yellow-400">
            Tipos de Errores Detectados
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <div>
                <strong>Inválido:</strong> Marcaciones rechazadas por el reloj biométrico (~9%)
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">•</span>
              <div>
                <strong>Repetido:</strong> Marcaciones duplicadas en el mismo momento (~4%)
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <div>
                <strong>Entrada sin Salida:</strong> Empleado marcó entrada pero no salida
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <div>
                <strong>Salida sin Entrada:</strong> Empleado marcó salida sin entrada previa
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">•</span>
              <div>
                <strong>FOT (válidas):</strong> Marcaciones correctas y procesables (~86%)
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
