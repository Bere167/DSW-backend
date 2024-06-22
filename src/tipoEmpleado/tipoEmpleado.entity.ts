import crypto from 'node:crypto';

export class TipoEmpleado {
  constructor(
    public dni_empleado: string,
    public nombre: string,
    public apellido: string,
    public tel: string,
    public mail: string,
    public domicilio: string,
    public cuil: string,
    public usuario: string,
    public id = crypto.randomUUID()
  ) {}
}
