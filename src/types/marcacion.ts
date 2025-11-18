// Formato 1: Archivo CON errores/excepciones (Marcaciones del...)
export interface MarcacionExcelConErrores {
  'Nº AC.': string;
  'Nº': string;
  'Nombre': string;
  'Tiempo': string;
  'Estado': 'Entrada' | 'Salida';
  'Nuevo Estado'?: string;
  'Excepción'?: 'FOT' | 'Invalido' | 'Repetido';
  'Operación'?: string;
}

// Formato 2: Archivo SIN errores (Ac Reg del...)
export interface MarcacionExcelSinErrores {
  'Departamento': string;
  'Nombre': string;
  'AC Nº': string;
  'Día/Hora': string;
  'Estado': 'Entrada' | 'Salida';
  'Equipo': string;
  'Número ID': string;
  'Modo Marc.': string;
  'Tarjeta': string;
}

// Unión de ambos tipos
export type MarcacionExcel = MarcacionExcelConErrores | MarcacionExcelSinErrores

export interface MarcacionNormalizada {
  numeroAC: string; // DNI
  numeroId?: string; // Rol/Legajo
  nombre: string;
  apellido: string;
  departamento?: string; // Escuela (solo en formato sin errores)
  fechaHora: Date;
  estado: 'Entrada' | 'Salida';
  excepcion: 'FOT' | 'Invalido' | 'Repetido';
  nuevoEstado?: string;
  operacion?: string;
}

export interface ParMarcacion {
  entrada: Date | null;
  salida: Date | null;
  horas: number;
  completo: boolean;
}

export interface ErrorMarcacion {
  tipo: 'entrada_sin_salida' | 'salida_sin_entrada' | 'repetido' | 'invalido' | 'secuencia_incorrecta';
  descripcion: string;
  hora: string;
  marcacion?: MarcacionNormalizada;
}

export interface AsistenciaDia {
  fecha: Date;
  pares: ParMarcacion[];
  horasTrabajadas: number;
  tieneErrores: boolean;
  errores: ErrorMarcacion[];
  observaciones: string;
}
