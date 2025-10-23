import crypto from 'node:crypto'

export class ProductosPedido {
  constructor(
    public cantidad: number,
    public precio_unitario: number,    // ← precio del producto en el momento del pedido
    public precio_parcial: number,     // ← cantidad * precio_unitario
    public id_producto: number,
    public id_pedido: number,
    public id?: number                 // ← ID único (opcional para insert)
  ) {}
}