import { ParMarcacion, ErrorMarcacion } from '@/types/marcacion'

export function calcularHorasDia(
  pares: ParMarcacion[],
  modo: 'tolerante' | 'estricto',
  errores: ErrorMarcacion[]
): number {

  if (modo === 'estricto' && errores.length > 0) {
    return 0
  }

  let totalHoras = 0

  for (const par of pares) {
    if (par.completo) {
      totalHoras += par.horas
    } else if (modo === 'tolerante') {
      if (par.entrada !== null && par.salida === null) {
        totalHoras += 8
      } else if (par.entrada === null && par.salida !== null) {
        totalHoras += 8
      }
    }
  }

  return Math.round(totalHoras * 100) / 100
}
