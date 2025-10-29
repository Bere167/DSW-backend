import { Request, Response, NextFunction } from "express"
import { TipoProductoRepository } from "./tipoproducto.repository.js"

const repository = new TipoProductoRepository()

function sanitizeTipoProductoInput(req: Request, res: Response, next: NextFunction) {
  // VALIDACIÓN 1: Campo requerido
  if (!req.body.nombre_tipo || req.body.nombre_tipo.trim() === '') {
    return res.status(400).json({ 
      message: 'El nombre del tipo de producto es requerido' 
    });
  }
    // VALIDACIÓN 2: Longitud mínima y máxima
  const nombreTipo = req.body.nombre_tipo.trim();
  if (nombreTipo.length > 100) {
    return res.status(400).json({ 
      message: 'El nombre no puede exceder 100 caracteres' 
    });
  }
  req.body.sanitizedInput = {
    nombre_tipo: req.body.nombre_tipo,
    desc_tipo: req.body.desc_tipo,

  }
  
 // Elimina campos undefined
   Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}
async function findAll(req: Request, res: Response) {
  try {
    const tipos = await repository.findAll();
    res.json({ data: tipos });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
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

  // VALIDACIÓN: Nombre único
  const tipoExistente = await repository.findByName(input.nombre_tipo);
  if (tipoExistente) {
    return res.status(409).json({ 
      message: 'Ya existe un tipo de producto con ese nombre' 
    });
  }

  const tipoproducto = await repository.add(input);
  return res.status(201).send({ message: 'Tipo de Producto creado exitosamente', data: tipoproducto });
}


async function update(req: Request, res: Response) {
  const input = req.body.sanitizedInput;
  const id = req.params.id;

  // VALIDACIÓN: Nombre único (excepto el actual)
  if (input.nombre_tipo) {
    const tipoExistente = await repository.findByName(input.nombre_tipo);
    if (tipoExistente && tipoExistente.idtipo_producto !== Number.parseInt(id)) {
      return res.status(409).json({ 
        message: 'Ya existe un tipo de producto con ese nombre' 
      });
    }
  }

  const tipoproducto = await repository.update(id, input);

  if (!tipoproducto) {
    return res.status(404).send({ 
      message: 'Tipo de Producto no encontrado' 
    })
  }

  return res.status(200).send({ 
    message: 'Tipo de Producto modificado exitosamente', 
    data: tipoproducto 
  })
}


async function remove(req: Request, res: Response) {
  const id = req.params.id;
  
  try {
    const tipoproducto = await repository.delete({ id });

    if (!tipoproducto) {
      return res.status(404).json({ 
        message: 'Tipo de producto no encontrado' 
      });
    }
    
    return res.status(200).json({ 
      message: 'Tipo de producto eliminado exitosamente' 
    });
  } catch (error: any) {
    return res.status(400).json({ 
      message: error.message || 'Error al eliminar el tipo de producto' 
    });
  }
}

export {sanitizeTipoProductoInput, findAll, findOne, add, update, remove}