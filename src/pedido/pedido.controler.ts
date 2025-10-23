import { Request, Response, NextFunction } from "express"
import { PedidoRepository } from "./pedido.repository.js"
import { Pedido } from "./pedido.entity.js"
import { pool } from '../shared/db/conn.mysql.js'
import { RowDataPacket } from 'mysql2'

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const repository = new PedidoRepository()

function sanitizePedidoInput(req: Request, res: Response, next: NextFunction) {

  req.body.sanitizedInput = {
    fecha_pedido: req.body.fecha_pedido,
    estado_pedido: req.body.estado_pedido,
    total_pedido: req.body.total_pedido,
  }

// El ID viene del token JWT
  req.body.sanitizedInput.id_usuario = req.user?.id; // Del middleware validateToken

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

async function findByFecha(req: Request, res: Response) {
  const fecha = req.query.fecha as string;
  
  if (!fecha) {
    return res.status(400).json({ message: 'Fecha es requerida (formato: YYYY-MM-DD)' });
  }
  
  try {
    const pedidos = await repository.findByFecha(fecha);
    
    if (!pedidos || pedidos.length === 0) {
      return res.status(404).json({ 
        message: 'No se encontraron pedidos para esa fecha',
        fecha_buscada: fecha
      });
    }

    res.json({ 
      data: pedidos,
      fecha_buscada: fecha,
      total_encontrados: pedidos.length
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error buscando por fecha' });
  }
}
async function findByEmail(req: Request, res: Response) {
  const email = req.query.email as string;
  
  if (!email) {
    return res.status(400).json({ message: 'Email es requerido' });
  }
  
  try {
    const pedidos = await repository.findByEmail(email);
    res.json({ data: pedidos || [] });
  } catch (error: any) {
    res.status(500).json({ error: 'Error buscando por email' });
  }
}

async function getMisPedidos(req: Request, res: Response) {
  const idUsuario = req.user?.id; // Del token JWT
  
  try {
    const pedidos = await repository.findByUsuario(idUsuario);
    res.json({ data: pedidos || [] });
  } catch (error: any) {
    res.status(500).json({ error: 'Error obteniendo pedidos del usuario' });
  }
}

async function add(req:Request, res:Response) {
  const input = req.body.sanitizedInput

  const pedidoInput = new Pedido(
    input.fecha_pedido || new Date(),
    input.estado_pedido || 'pendiente',
    input.total_pedido || 0,
    input.id_usuario
  );

  try {
    const pedido = await repository.add(pedidoInput);
    return res.status(201).send({ 
      message: 'Pedido creado exitosamente', 
      data: pedido 
    });
  } catch (error: any) {
    return res.status(400).send({ message: error.message });
  }
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

async function marcarComoEntregado(req: Request, res: Response) {
  const id = req.params.id;

  try {
    const pedido = await repository.findOne({ id });
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Verificar que esté pendiente
    if (pedido.estado_pedido.toLowerCase() !== 'pendiente') {
      return res.status(400).json({ 
        message: 'Solo se pueden entregar pedidos pendientes' 
      });
    }
    // Marcar como entregado
    const updated = await repository.updateEstado(Number(id), 'entregado');
    
    return res.status(200).json({ 
      message: 'Pedido marcado como entregado', 
      data: updated 
    });

  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
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
    
    // Mensaje diferente según si restauró stock o no
    const mensaje = pedido.estado_pedido === 'entregado' 
      //si es verdadero (pedido entregado)
      ? 'Pedido eliminado exitosamente' 
      //si es falso (pedido pendiente)
      : 'Pedido eliminado y stock restaurado';
    
    return res.status(200).json({ message: mensaje });
    
  } catch (error: any) {
    return res.status(400).json({ 
      message: error.message || 'Error al eliminar el pedido' 
    });
  }
}

// Crear pedido desde carrito (e-commerce)
async function createFromCart(req: Request, res: Response) {
  const { items } = req.body;
  const idUsuario = req.user?.id; // Del token JWT

   if (!idUsuario) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }
  
  // Validar que hay items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'El carrito está vacío' });
  }

  // Validar estructura de items
  for (const item of items) {
    if (!item.id_producto || !item.cantidad || item.cantidad <= 0) {
      return res.status(400).json({ 
        message: 'Cada item debe tener id_producto y cantidad válida' 
      });
    }
  }
    try {
    const pedido = await repository.crearDesdeCarrito(idUsuario, items);
    res.status(201).json({
      message: 'Pedido creado exitosamente',
      data: pedido
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// Obtener precios actuales (sin login)
async function obtenerPreciosProductos(req: Request, res: Response) {
  const { productos } = req.body; // Array de IDs: [1, 3, 5]
  
  if (!productos || !Array.isArray(productos)) {
    return res.status(400).json({ message: 'Array de productos requerido' });
  }
  
  try {
    const placeholders = productos.map(() => '?').join(',');
    const [productosData] = await pool.query<RowDataPacket[]>(
      `SELECT idproducto, nombre_prod, precio, cant_stock as stock
       FROM producto 
       WHERE idproducto IN (${placeholders}) AND activo = TRUE`,
      productos
    );
    
    res.json({ data: productosData });
  } catch (error: any) {
    res.status(500).json({ error: 'Error obteniendo precios' });
  }
}

export {sanitizePedidoInput, findAll, findOne, findByFecha, findByEmail, getMisPedidos, add, createFromCart, updateEstado, remove, obtenerPreciosProductos, marcarComoEntregado}