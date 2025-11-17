import { format } from 'date-fns'
import { MarcacionNormalizada, ErrorMarcacion } from '@/types/marcacion'

export function detectarErroresDia(
  marcaciones: MarcacionNormalizada[]
): ErrorMarcacion[] {
  const errores: ErrorMarcacion[] = []

  // 1. Filtrar y reportar marcas inválidas
  const invalidas = marcaciones.filter(m => m.excepcion === 'Invalido')
  for (const m of invalidas) {
    errores.push({
      tipo: 'invalido',
      descripcion: 'Marcación marcada como inválida por el sistema del reloj',
      hora: format(m.fechaHora, 'HH:mm'),
      marcacion: m
    })
  }

  // 2. Filtrar y reportar marcas repetidas
  const repetidas = marcaciones.filter(m => m.excepcion === 'Repetido')
  for (const m of repetidas) {
    errores.push({
      tipo: 'repetido',
      descripcion: 'Marcación repetida',
      hora: format(m.fechaHora, 'HH:mm'),
      marcacion: m
    })
  }

  // 3. Trabajar solo con marcaciones válidas (FOT)
  const marcasValidas = marcaciones
    .filter(m => m.excepcion === 'FOT')
    .sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime())

  // 4. Verificar secuencia Entrada-Salida
  let esperaSalida = false
  let ultimaEntrada: MarcacionNormalizada | null = null

  for (const marca of marcasValidas) {
    if (marca.estado === 'Entrada') {
      if (esperaSalida && ultimaEntrada) {
        errores.push({
          tipo: 'entrada_sin_salida',
          descripcion: `Entrada a las ${format(ultimaEntrada.fechaHora, 'HH:mm')} sin salida correspondiente`,
          hora: format(ultimaEntrada.fechaHora, 'HH:mm'),
          marcacion: ultimaEntrada
        })
      }
      esperaSalida = true
      ultimaEntrada = marca
    } else {
      if (!esperaSalida) {
        errores.push({
          tipo: 'salida_sin_entrada',
          descripcion: 'Salida sin entrada previa',
          hora: format(marca.fechaHora, 'HH:mm'),
          marcacion: marca
        })
      }
      esperaSalida = false
      ultimaEntrada = null
    }
  }

  // 5. Si quedó una entrada sin cerrar
  if (esperaSalida && ultimaEntrada) {
    errores.push({
      tipo: 'entrada_sin_salida',
      descripcion: `Última entrada a las ${format(ultimaEntrada.fechaHora, 'HH:mm')} sin salida`,
      hora: format(ultimaEntrada.fechaHora, 'HH:mm'),
      marcacion: ultimaEntrada
    })
  }

  return errores
}
