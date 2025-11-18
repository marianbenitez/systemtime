export interface Empleado {
  id: number;
  numeroAC: string; // DNI
  numeroId?: string; // Rol/Legajo
  nombre: string;
  apellido: string;
  departamento?: string; // Escuela
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmpleadoConEstadisticas extends Empleado {
  totalDiasTrabajados: number;
  totalHoras: number;
  diasConErrores: number;
}
