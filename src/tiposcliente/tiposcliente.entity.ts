import { ObjectId } from 'mongodb';
import  crypto from 'node:crypto';

export class TipoCliente {
    constructor(
    public tiposclienteClass: string, 
    public desctipo: string,
    public porcdescuento: GLfloat,
    public _id?: ObjectId
  ) {}
}