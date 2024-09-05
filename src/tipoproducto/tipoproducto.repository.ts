import { Repository } from "../shared/repository.js";
import { TipoProducto } from "./tipoproducto.entity.js";
import {db} from "../shared/db/conn.js";
import { ObjectId } from "mongodb";


const tiposproducto = db.collection<TipoProducto>('tiposProducto')

export class TipoProductoRepository implements Repository<TipoProducto>{

   public async findAll(): Promise<TipoProducto[] | undefined> {
    return await tiposproducto.find().toArray()
  }

  public async findOne(item: { id: string }): Promise<TipoProducto | undefined> {
    const _id = new ObjectId(item.id);
    return (await tiposproducto.findOne({_id})) || undefined

  }

  public async  add(item: TipoProducto): Promise<TipoProducto | undefined> {
    item._id=(await tiposproducto.insertOne(item)).insertedId
    return item
  }

  public async update(id:string, item: TipoProducto): Promise<TipoProducto | undefined> {
    const _id = new ObjectId(id);
    return (await tiposproducto.findOneAndUpdate({_id}, {$set: item}, {returnDocument: 'after'})) || undefined
  }

  public async delete(item: { id: string }): Promise<TipoProducto | undefined> {
    const _id = new ObjectId(item.id);
      return (await tiposproducto.findOneAndDelete({_id})) || undefined
    }
  } 
