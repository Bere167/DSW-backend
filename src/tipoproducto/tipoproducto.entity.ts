import { ObjectId } from 'mongodb';
import crypto from 'node:crypto'

export class TipoProducto {
  constructor(
    public name: string,
    public descprod: string,
    public _id ?: ObjectId
  ) {}
}