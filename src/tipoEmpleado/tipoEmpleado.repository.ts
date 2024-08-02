import { ObjectId } from "mongodb";
import { Repository } from "../shared/repository.js";
import { TipoEmpleado } from "./tipoEmpleado.entity.js";
import { db } from "../shared/db/conn.js";

const tiposEmpleado = db.collection<TipoEmpleado>('tiposEmpleado');

export class TipoEmpleadoRepository implements Repository<TipoEmpleado> {
  
  public async findAll(): Promise <TipoEmpleado[] | undefined> {
    return  await tiposEmpleado.find().toArray()
  }

  public async findOne(item: { id: string }): Promise<TipoEmpleado | undefined> {
    const _id= new ObjectId(item.id);
    return (await tiposEmpleado.findOne({_id})) || undefined;
  }

  public async add(item: TipoEmpleado): Promise<TipoEmpleado | undefined> {
    item._id = (await tiposEmpleado.insertOne(item)).insertedId;
    return item;
  }

  public async update(id:string, item: TipoEmpleado): Promise <TipoEmpleado | undefined> {
    const _id = new ObjectId(item._id);
    return (await tiposEmpleado.findOneAndUpdate({_id}, {$set: item}, {returnDocument: 'after'})) || undefined;
  }

  public async delete(item: { id: string }): Promise<TipoEmpleado | undefined> {
    const _id = new ObjectId(item.id);
      return (await tiposEmpleado.findOneAndDelete({_id})) || undefined;
    }
  }

