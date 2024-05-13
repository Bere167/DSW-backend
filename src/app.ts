import express, { Express, NextFunction, Response,Request } from "express";
import { TipoCliente } from "./tiposcliente.js";
import {it} from 'node:test'


export const app = express()
app.use(express.json())

//user -- request --express -- express.json() -- app.post (req.body) -- response -- user

export const tiposcliente= [
  new TipoCliente(
  'Minorista',
  'Cliente sin compra minima',
  0,
  'user-minorista-2024-1234-dsw',
),
]

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
     res.json({data:tiposcliente})
})

//obtener un tipo cliente por id
app.get('/api/tiposcliente/:id',(req,res)=>{
  const tipocliente = tiposcliente.find((tipocliente)=>tipocliente.id === req.params.id)
  if(!tipocliente){
    return res.status(404).send({message:'Cliente no encontrado'})
  }
  res.json(tiposcliente)
})

//crear un tipo cliente
app.post('/api/tiposcliente', sanitizeTipoClienteInput,(req,res)=>{
  const input= req.body.sanitizedInput
  
  const tipocliente = new TipoCliente(
    input.tipoclienteClass,
    input.desctipo,
    input.porcdescuento
  )

  tiposcliente.push(tipocliente)
  return res.status(201).send({message:'Cliente creado exitosamente',data:tipocliente})
})

//modificar un tipo cliente (todas las propiedades)
app.put('/api/tiposcliente/:id', (req, res) => {
  const tipoclienteIdx = tiposcliente.findIndex((tipocliente) => tipocliente.id === req.params.id);
  
  if (tipoclienteIdx === -1) {
    return res.status(404).send({ message: 'Cliente no encontrado' });
  }
  
  Object.assign (tiposcliente[tipoclienteIdx],req.body)
  return res.status(200).send({message:'Cliente modificado exitosamente', data: tiposcliente[tipoclienteIdx]})
})

//modificar un tipo cliente(solo algunas propiedades)
//sanitiseTipoClienteInput no es una funcion de middleware,por eso solo uso req.body
app.patch('/api/tiposcliente/:id',(req, res) => {
  const tipoclienteIdx = tiposcliente.findIndex((tipocliente) => tipocliente.id === req.params.id)
  
  if (tipoclienteIdx === -1) {
    return res.status(404).send({ message: 'Cliente no encontrado' });
  }
  
  Object.assign (tiposcliente[tipoclienteIdx],req.body)
  return res.status(200).send({message:'Cliente modificado exitosamente', data: tiposcliente[tipoclienteIdx]})
})

//borrar un tipo cliente
app.delete('/api/tiposcliente/:id', (req, res) => {
 const tipoclienteIdx = tiposcliente.findIndex((tipocliente) => tipocliente.id === req.params.id)
 if (tipoclienteIdx === -1) {
    return res.status(404).send({ message: 'Cliente no encontrado' });
 } 
 tiposcliente.splice(tipoclienteIdx,1)
 return res.status(200).send({message:'Cliente borrado exitosamente'})
})

//para cuando el url esta mal escrito
app.use((req, res) => {
  return res.status(404).send({message: 'Ruta no encontrada'})
})

//defino puerto en el que se va a correr el servidor
app.listen(4000,()=>{
  console.log('Server is running on http://localhost:4000/')
})