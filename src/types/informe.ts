export interface Informe {
  id: number;
  empleadoId: number;
  tipoInforme: 'tolerante' | 'estricto';
  fechaInicio: Date;
  fechaFin: Date;
  archivoPath?: string;
  totalDiasTrabajados?: number;
  totalHoras?: number;
  createdAt: Date;
}

export interface GenerarInformeParams {
  empleadoId: number;
  fechaInicio: Date;
  fechaFin: Date;
  modo: 'tolerante' | 'estricto';
}
