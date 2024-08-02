import { Repository } from "../shared/repository.js";
import { TipoCliente } from "./tiposcliente.entity.js";
import {db} from "../shared/db/conn.js";
import { ObjectId } from "mongodb";

const tiposcliente = db.collection<TipoCliente>('tiposcliente')

export class TiposclienteRepository implements Repository<TipoCliente>{

  public async findAll(): Promise <TipoCliente[] | undefined> {
    return await tiposcliente.find().toArray()
  }

  public async findOne(item: {id: string}): Promise <TipoCliente | undefined >{
    const _id= new ObjectId(item.id);
    return (await tiposcliente.findOne({_id})) || undefined
    //return  await tiposclienteArray.find((tipocliente)=>tipocliente.id === item.id)
  }

  public async add(item: TipoCliente): Promise< TipoCliente | undefined> {  
     item._id = (await tiposcliente.insertOne(item)).insertedId
    return item
  } 

   public async update(id:string,item: TipoCliente): Promise <TipoCliente | undefined> { 
    const _id= new ObjectId(id);
    return(await tiposcliente.findOneAndUpdate({_id}, {$set: item },{returnDocument:'after'})) || undefined //envio objeto a modificar
    }


  public async delete(item: {id: string}): Promise <TipoCliente | undefined> {
    const _id= new ObjectId(item.id);
    return( await tiposcliente.findOneAndDelete({_id})) || undefined
  }
}