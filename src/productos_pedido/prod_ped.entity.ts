import crypto from 'node:crypto'

export class ProductosPedido {
  constructor(
    public cantidad : number,
    public id_producto: number, // <-- clave primaria,
    public id_pedido: number // <-- clave foránea
  ) {}}