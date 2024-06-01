import express, { NextFunction, Response,Request } from "express";
import { TipoCliente } from "./tiposcliente/tiposcliente.entity.js";
//import {it} from 'node:test'
import { TiposclienteRepository } from "./tiposcliente/tiposcliente.repository.js";


const app = express()
app.use(express.json())

//user -- request --express -- express.json() -- app.post (req.body) -- response -- user
const repository = new TiposclienteRepository()



function sanitizeTipoClienteInput(req: Request, res: Response, next: NextFunction){
  req.body.sanitizedInput = {
    tipoclienteClass: req.body.tipoclienteClass,
    desctipo: req.body.desctipo,
    porcdescuento: req.body.porcdescuento
  }
  //more checks here

  next()
}

//obtener una lista de todos los tipos de cliente
app.get('/api/tiposcliente',(req,res)=>{
     res.json({data:repository.findAll()})
})

//obtener un tipo cliente por id
app.get('/api/tiposcliente/:id',(req,res)=>{
  
  const tipocliente = repository.findOne({id:req.params.id})
  if(!tipocliente){
    return res.status(404).send({message:'Cliente no encontrado'})
  }
  res.json({data:tipocliente})
})

//crear un tipo cliente
app.post('/api/tiposcliente', sanitizeTipoClienteInput,(req,res)=>{
  const input= req.body.sanitizedInput
  
  const tipoclienteInput = new TipoCliente(
    input.tipoclienteClass,
    input.desctipo,
    input.porcdescuento
  )

  const tipocliente = repository.add(tipoclienteInput)
  return res.status(201).send({message:'Cliente creado exitosamente',data:tipocliente})
})

//modificar un tipo cliente (todas las propiedades)
app.put('/api/tiposcliente/:id', (req, res) => {
  req.body.id = req.params.id
  const tipocliente = repository.update(req.body)
  
  if (!tipocliente){
    return res.status(404).send({ message: 'Cliente no encontrado' });
  }

  return res.status(200).send({message:'Cliente modificado exitosamente', data: tipocliente})
})

//modificar un tipo cliente(solo algunas propiedades)
//sanitiseTipoClienteInput no es una funcion de middleware,por eso solo uso req.body
app.patch('/api/tiposcliente/:id',(req, res) => {
  req.body.id = req.params.id
  const tipocliente = repository.update(req.body)
  
  if (!tipocliente) {
    return res.status(404).send({ message: 'Cliente no encontrado' });
  }
  
  return res.status(200).send({message:'Cliente modificado exitosamente', data: tipocliente})
})

//borrar un tipo cliente
app.delete('/api/tiposcliente/:id', (req, res) => {
const id= req.params.id
const tipocliente = repository.delete({id:req.params.id})

 if (!tipocliente) {
    return res.status(404).send({ message: 'Cliente no encontrado' });
 } else{
 return res.status(200).send({message:'Cliente borrado exitosamente'})}
})

//para cuando el url esta mal escrito
app.use((req, res) => {
  return res.status(404).send({message: 'Ruta no encontrada'})
})

//defino puerto en el que se va a correr el servidor
app.listen(4000,()=>{
  console.log('Server is running on http://localhost:4000/')
})