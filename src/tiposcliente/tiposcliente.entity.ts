import  crypto from 'node:crypto';
import {app, tiposcliente} from "../app";

export class TipoCliente {
    constructor(
    public tiposclienteClass: string, 
    public desctipo: string,
    public porcdescuento: GLfloat,
    public id= crypto.randomUUID()
  ) {}
}