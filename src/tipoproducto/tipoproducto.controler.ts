import { Request, Response, NextFunction } from "express"
import { TipoProductoRepository } from "./tipoproducto.repository.js"
import { TipoProducto } from "./tipoproducto.entity.js"

const repository = new TipoProductoRepository()

function sanitizeTipoProductoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    descprod: req.body.descprod,

  }
  //more checks here

   Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}
async function findAll(req:Request, res:Response) {
  res.json({data:await repository.findAll() })
}

async function findOne(req:Request, res:Response) {
  const id = req.params.id
  const tipoproducto = await repository.findOne({id})
  if (!tipoproducto) {
    return res.status(404).send({ message: 'Tipo producto no encontrado' })
    
  }
  res.json({data:tipoproducto})
}

async function add(req:Request, res:Response) {
  const input = req.body.sanitizedInput

  const tipoproductoInput = new TipoProducto(
    input.name,
    input.descprod
  )

  const tipoproducto = await repository.add(tipoproductoInput)
  return res.status(201).send({ message: 'Tipo de Producto creado exitosamente', data: tipoproducto })
}


async function update(req: Request, res: Response) {
  const tipoproducto = await repository.update(req.params.id,req.body.sanitizedInput)

  if (!tipoproducto) {
    return res.status(404).send({ message: 'Tipo de Producto no encontrado' })
  }

  return res.status(200).send({ message: 'Tipo de Producto modificado exitosamente', data: tipoproducto })
}


async function remove(req:Request, res:Response) {
  const id  = req.params.id
  const tipoproducto = await repository.delete({id})

  if (!tipoproducto) {
    res.status(404).send({ message: 'Tipo de producto no encontrado' })
  } else {
    res.status(200).send({ message: 'Tipo de producto borrado exitosamente' })
  }
}

export {sanitizeTipoProductoInput, findAll, findOne, add, update, remove}