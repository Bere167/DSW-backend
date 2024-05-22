import { Repository } from "../shared/repository.js";
import { TipoCliente } from "./tiposcliente.entity.js";

const tiposcliente= [
  new TipoCliente(
  'Minorista',
  'Cliente sin compra minima',
  0,
  'user-minorista-2024-1234-dsw',
),
]

export class TiposclienteRepository implements Repository<TipoCliente>{

  public findAll(): TipoCliente[] | undefined {
    return tiposcliente
  }

  public findOne(item: {id: string}): TipoCliente | undefined {
    return tiposcliente.find((tipocliente)=>tipocliente.id === item.id)
  }

  public add(item: TipoCliente): TipoCliente | undefined {  
    tiposcliente.push(item)
    return item
  } 

  public update(item: TipoCliente): TipoCliente | undefined { 
   const tipoclienteIdx = tiposcliente.findIndex((tipocliente) => tipocliente.id === item.id);
  
  if (tipoclienteIdx !== -1) {
     Object.assign (tiposcliente[tipoclienteIdx],item)
  }
  return tiposcliente[tipoclienteIdx]
  }


  public delete(item: {id: string}): TipoCliente | undefined {
    const tipoclienteIdx = tiposcliente.findIndex((tipocliente) => tipocliente.id === item.id);
   if (tipoclienteIdx !== -1) {
    const deletedTiposcliente = tiposcliente[tipoclienteIdx]
     tiposcliente.splice(tipoclienteIdx,1)
 return deletedTiposcliente
   }
  }
}