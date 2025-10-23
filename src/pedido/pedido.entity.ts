import crypto from 'node:crypto'

export class Pedido {
  constructor(
    public fecha_pedido: Date,
    public estado_pedido: string = 'Pendiente',  //pendiente, entregado, cancelado,etc
    public total_pedido : number = 0,
    public id_usuario: number,
    public id_pedido ?: number
  ) {}

}