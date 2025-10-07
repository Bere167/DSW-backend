import crypto from 'node:crypto'

export class Pedido {
  constructor(
    public fecha_pedido: string,
    public estado_pedido: string,
    public total_pedido : number,
    public id_usuario: number,
    public id_pedido ?: number
  ) {}}