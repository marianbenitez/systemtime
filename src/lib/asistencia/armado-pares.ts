import { MarcacionNormalizada, ParMarcacion } from '@/types/marcacion'

export function armarParesEntradaSalida(
  marcaciones: MarcacionNormalizada[]
): ParMarcacion[] {
  const pares: ParMarcacion[] = []

  const marcasValidas = marcaciones
    .filter(m => m.excepcion === 'FOT')
    .sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime())

  let entradaActual: Date | null = null

  for (const marca of marcasValidas) {
    if (marca.estado === 'Entrada') {
      if (entradaActual !== null) {
        pares.push({
          entrada: entradaActual,
          salida: null,
          horas: 0,
          completo: false
        })
      }
      entradaActual = marca.fechaHora
    } else {
      if (entradaActual !== null) {
        const horas = calcularDiferenciaHoras(entradaActual, marca.fechaHora)
        pares.push({
          entrada: entradaActual,
          salida: marca.fechaHora,
          horas,
          completo: true
        })
        entradaActual = null
      } else {
        pares.push({
          entrada: null,
          salida: marca.fechaHora,
          horas: 0,
          completo: false
        })
      }
    }
  }

  if (entradaActual !== null) {
    pares.push({
      entrada: entradaActual,
      salida: null,
      horas: 0,
      completo: false
    })
  }

  return pares
}

function calcularDiferenciaHoras(entrada: Date, salida: Date): number {
  let diff = salida.getTime() - entrada.getTime()

  if (diff < 0) {
    diff += 24 * 60 * 60 * 1000
  }

  const horas = diff / (1000 * 60 * 60)
  return Math.round(horas * 100) / 100
}
