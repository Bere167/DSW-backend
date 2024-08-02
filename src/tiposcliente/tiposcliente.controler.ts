import {Request, Response, NextFunction } from 'express'
import { TiposclienteRepository } from './tiposcliente.repository.js'
import { TipoCliente } from './tiposcliente.entity.js'

const repository = new TiposclienteRepository()

function sanitizeTipoClienteInput(req: Request, res: Response, next: NextFunction){
  req.body.sanitizedInput = {
    tipoclienteClass: req.body.tipoclienteClass,
    desctipo: req.body.desctipo,
    porcdescuento: req.body.porcdescuento
  }
  //more checks here
  Object.keys(req.body.sanitizedInput).forEach((key) => {
  if (req.body.sanitizedInput[key] === undefined){
    delete req.body.sanitizedInput[key]
  }
})
  next()
}

//obtener una lista de todos los tipos de cliente
 async function findAll(req:Request,res:Response){
     res.json({data: await repository.findAll()})
}


//obtener un tipo cliente por id
async function findOne(req:Request,res:Response){
  const id= req.params.id
  const tipocliente = await repository.findOne({id:req.params.id})
  if(!tipocliente){
    return res.status(404).send({message:'Cliente no encontrado'})
  }
  res.json({data:tipocliente})
}

//crear un tipo cliente
async function add (req:Request,res:Response){
  const input= req.body.sanitizedInput
  
  const tipoclienteInput = new TipoCliente(
    input.tipoclienteClass,
    input.desctipo,
    input.porcdescuento
  )

  const tipocliente = await repository.add(tipoclienteInput)
  return res.status(201).send({message:'Cliente creado exitosamente',data:tipocliente})
}

//modificar un tipo cliente (todas las propiedades)
async function update(req:Request,res:Response){
  const tipocliente = await repository.update(req.params.id,req.body)
  
  if (!tipocliente){
    return res.status(404).send({ message: 'Cliente no encontrado' });
  }

  return res.status(200).send({message:'Cliente modificado exitosamente', data: tipocliente})
}

//borrar un tipo cliente
async function remove (req:Request,res:Response){
const id= req.params.id
const tipocliente = await repository.delete({id})

 if (!tipocliente) {
    return res.status(404).send({ message: 'Cliente no encontrado' });
 } else{
 return res.status(200).send({message:'Cliente borrado exitosamente'})}
}

export{sanitizeTipoClienteInput, findAll, findOne, add, update, remove}