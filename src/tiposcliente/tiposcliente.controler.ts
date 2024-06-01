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
function findAll(req:Request,res:Response){
     res.json({data:repository.findAll()})
}


//obtener un tipo cliente por id
function findOne(req:Request,res:Response){
  
  const tipocliente = repository.findOne({id:req.params.id})
  if(!tipocliente){
    return res.status(404).send({message:'Cliente no encontrado'})
  }
  res.json({data:tipocliente})
}

//crear un tipo cliente
function add (req:Request,res:Response){
  const input= req.body.sanitizedInput
  
  const tipoclienteInput = new TipoCliente(
    input.tipoclienteClass,
    input.desctipo,
    input.porcdescuento
  )

  const tipocliente = repository.add(tipoclienteInput)
  return res.status(201).send({message:'Cliente creado exitosamente',data:tipocliente})
}

//modificar un tipo cliente (todas las propiedades)
function update(req:Request,res:Response){
  req.body.id = req.params.id
  const tipocliente = repository.update(req.body)
  
  if (!tipocliente){
    return res.status(404).send({ message: 'Cliente no encontrado' });
  }

  return res.status(200).send({message:'Cliente modificado exitosamente', data: tipocliente})
}

//borrar un tipo cliente
function remove (req:Request,res:Response){
const id= req.params.id
const tipocliente = repository.delete({id:req.params.id})

 if (!tipocliente) {
    return res.status(404).send({ message: 'Cliente no encontrado' });
 } else{
 return res.status(200).send({message:'Cliente borrado exitosamente'})}
}

export{sanitizeTipoClienteInput, findAll, findOne, add, update, remove}