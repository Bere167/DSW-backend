import { Request, Response, NextFunction } from "express"
import { PedidoRepository } from "./pedido.repository.js"
import { Pedido } from "./pedido.entity.js"

const repository = new PedidoRepository()

function sanitizePedidoInput(req: Request, res: Response, next: NextFunction) {
  // VALIDACIÓN 1: Campo requerido
  if (!req.body.fecha_pedido || req.body.fecha_pedido.trim() === '') {
    return res.status(400).json({ 
      message: 'La fecha del pedido es requerida' 
    });
  }
    // VALIDACIÓN 2: Formato de fecha YYYY-MM-DD
  const fechaPedido = req.body.fecha_pedido.trim();
  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!fechaRegex.test(fechaPedido)) {
    return res.status(400).json({
      message: 'El formato de la fecha debe ser YYYY-MM-DD' 
    });
  }
  req.body.sanitizedInput = {
    fecha_pedido: req.body.fecha_pedido,
    estado_pedido: req.body.estado_pedido,
    total_pedido: req.body.total_pedido,
    id_usuario: req.body.id_usuario,
  }

// Elimina campos undefined
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
  const pedido = await repository.findOne({id})
  if (!pedido) {
    return res.status(404).send({ message: 'Pedido no encontrado' })
    
  }
  res.json({data:pedido})
}

async function add(req:Request, res:Response) {
  const input = req.body.sanitizedInput

   /* // VALIDACIÓN: Nombre único
  const pedidoExistente = await repository.findOne(input.id_pedido);
  if (pedidoExistente) {
    return res.status(409).json({
      message: 'Ya existe un pedido con ese ID'
    });
  }*//*NO SE NECESITA EN PEDIDO*/

  const pedidoInput = new Pedido(
    input.fecha_pedido,
    input.estado_pedido,
    input.total_pedido,
    input.id_usuario
  )

  const pedido = await repository.add(pedidoInput)
  return res.status(201).send({ message: 'Pedido creado exitosamente', data: pedido })
}
  
/*no hacemos update porque no se puede modificar un pedido, solo su estado*/
async function updateEstado(req: Request, res: Response) {
  const id = req.params.id;
  const { estado_pedido } = req.body;

  // Validar que se envíe el nuevo estado
  if (!estado_pedido || typeof estado_pedido !== 'string' || estado_pedido.trim() === '') {
    return res.status(400).json({ message: 'El estado del pedido es requerido' });
  }

  // Buscar el pedido
  const pedido = await repository.findOne({ id });
  if (!pedido) {
    return res.status(404).json({ message: 'Pedido no encontrado' });
  }

  // Actualizar solo el estado
  const updated = await repository.updateEstado(Number(id), estado_pedido.trim());
  return res.status(200).json({ message: 'Estado del pedido actualizado', data: updated });
}

async function remove(req: Request, res: Response) {
  const id = req.params.id;
  
  try {
    const pedido = await repository.delete({ id });

    if (!pedido) {
      return res.status(404).json({ 
        message: 'Pedido no encontrado' 
      });
    }
    
    return res.status(200).json({ 
      message: 'Pedido eliminado exitosamente' 
    });
  } catch (error: any) {
    return res.status(400).json({ 
      message: error.message || 'Error al eliminar el pedido' 
    });
  }
}

export {sanitizePedidoInput, findAll, findOne, add, updateEstado, remove}