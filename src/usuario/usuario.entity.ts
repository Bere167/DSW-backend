import crypto from 'node:crypto'

export class Usuario {
  constructor(
    public user_usuario: string,
    public contraseña: string,
    public email_usuario: string,
    public tel_usuario: number,
    public direccion_usuario: string,
    public nombre_usuario: string,
    public apellido_usuario: string,
    public tipo_usuario: string,
    public id_usuario ?: number
  ) {}}