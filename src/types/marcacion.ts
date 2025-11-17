export interface MarcacionExcel {
  'Nº AC.': string;
  'Nº': string;
  'Nombre': string;
  'Tiempo': string;
  'Estado': 'Entrada' | 'Salida';
  'Nuevo Estado'?: string;
  'Excepción'?: 'FOT' | 'Invalido' | 'Repetido';
  'Operación'?: string;
}

export interface MarcacionNormalizada {
  numeroAC: string;
  numeroEmpleado: string;
  nombre: string;
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
