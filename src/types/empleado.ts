export interface Empleado {
  id: number;
  numeroAC: string;
  numeroEmpleado?: string;
  nombre: string;
  departamento?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmpleadoConEstadisticas extends Empleado {
  totalDiasTrabajados: number;
  totalHoras: number;
  diasConErrores: number;
}
