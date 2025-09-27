import crypto from 'node:crypto'

export class TipoProducto {
  constructor(
    public nombre_tipo: string,
    public desc_tipo ?: string,
    public id ?: number
  ) {}}
