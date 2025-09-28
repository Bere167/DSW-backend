import crypto from 'node:crypto'

export class Producto {
  constructor(
    public nombre_prod: string,
    public precio: number,
    public idproducto ?: number,
    public desc_prod ?: string,
    public cant_stock ?: number,
    public imagen ?: string,
    public id_tipoprod ?: number // <-- clave foránea
  ) {}}