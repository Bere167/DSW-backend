import { Request, Response, NextFunction } from "express";
import { ProductoRepository } from "./producto.repository.js";

const repository = new ProductoRepository();

function sanitizeProductoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre_prod: req.body.nombre_prod,
    precio: req.body.precio,
    desc_prod: req.body.desc_prod,
    cant_stock: req.body.cant_stock,
    imagen: req.body.imagen,
    id_tipoprod: req.body.id_tipoprod,
    activo: req.body.activo
  };
  // Elimina campos undefined
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

// --- VALIDACIÓN DE CAMPOS OBLIGATORIOS Y TIPOS ---
function validateProductoInput(input: any): string | null {
  if (!input.nombre_prod || typeof input.nombre_prod !== 'string') {
    return 'El nombre del producto es obligatorio y debe ser texto.';
  }
  if (input.precio === undefined || typeof input.precio !== 'number' || input.precio <= 0) {
    return 'El precio es obligatorio y debe ser un número mayor a cero.';
  }
  if (input.id_tipoprod === undefined || typeof input.id_tipoprod !== 'number') {
    return 'El tipo de producto es obligatorio y debe ser un número.';
  }
  if (input.cant_stock !== undefined && (typeof input.cant_stock !== 'number' || input.cant_stock < 0)) {
    return 'El stock debe ser un número igual o mayor a cero.';
  }
  return null;
}


async function findAll(req: Request, res: Response) {
  res.json({ data: await repository.findAll() });
}

async function findRandom(req: Request, res: Response) {
  const cantidad = Number.parseInt(req.query.cantidad as string) || 8;
  const productos = await repository.findRandom(cantidad);
  res.json({ data: productos });
}

async function findOne(req: Request, res: Response) {
  const id = req.params.id;
  const producto = await repository.findOne({ id });
  if (!producto) {
    return res.status(404).send({ message: 'Producto no encontrado' });
  }
  res.json({ data: producto });
}

async function findByName(req: Request, res: Response) {
  const nombre = req.params.nombre;
  const producto = await repository.findByName(nombre);
  if (!producto) {
    return res.status(404).send({ message: 'Producto no encontrado' });
  }
  res.json({ data: producto });
}

async function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput;
  const error = validateProductoInput(input);
  if (error) {
    return res.status(400).send({ message: error });
  }

  // Validar que no exista un producto con el mismo nombre
  const existente = await repository.findByName(input.nombre_prod);
  if (existente) {
    return res.status(409).send({ message: 'Ya existe un producto con ese nombre.' });
  }

  // Validar que el tipo de producto exista
  if (!(await repository['tipoProductoExists'](input.id_tipoprod))) {
    return res.status(400).send({ message: 'El tipo de producto especificado no existe.' });
  }

  try {
    const producto = await repository.add(input);
    return res.status(201).send({ message: 'Producto creado exitosamente', data: producto });
  } catch (error: any) {
    return res.status(400).send({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  const id = req.params.id;
  const input = req.body.sanitizedInput;

  try {
    // Validar que el producto exista
    const productoExistente = await repository.findOne({ id });
    if (!productoExistente) {
      return res.status(404).send({ message: 'Producto no encontrado' });
    }

    // Evitar actualizaciones vacías
    if (!input || Object.keys(input).length === 0) {
      return res.status(400).send({ message: 'No se enviaron campos para modificar.' });
    }

    // Validar tipos y valores (TUS VALIDACIONES)
    if (input.nombre_prod !== undefined && typeof input.nombre_prod !== 'string') {
      return res.status(400).send({ message: 'El nombre del producto debe ser texto.' });
    }
    if (input.precio !== undefined && (typeof input.precio !== 'number' || input.precio <= 0)) {
      return res.status(400).send({ message: 'El precio debe ser un número mayor a cero.' });
    }
    if (input.id_tipoprod !== undefined && typeof input.id_tipoprod !== 'number') {
      return res.status(400).send({ message: 'El tipo de producto debe ser un número.' });
    }
    if (input.cant_stock !== undefined && (typeof input.cant_stock !== 'number' || input.cant_stock < 0)) {
      return res.status(400).send({ message: 'El stock debe ser un número igual o mayor a cero.' });
    }

    // Validar nombre duplicado (TU VALIDACIÓN)
    if (input.nombre_prod !== undefined && input.nombre_prod !== productoExistente.nombre_prod) {
      const existente = await repository.findByName(input.nombre_prod);
      if (existente && existente.idproducto !== Number(id)) {
        return res.status(409).send({ message: 'Ya existe un producto con ese nombre.' });
      }
    }

    // Validar tipo producto existe (TU VALIDACIÓN)
    if (input.id_tipoprod !== undefined && input.id_tipoprod !== productoExistente.id_tipoprod) {
      if (!(await repository['tipoProductoExists'](input.id_tipoprod))) {
        return res.status(400).send({ message: 'El tipo de producto especificado no existe.' });
      }
    }

    // SI SE CAMBIA EL PRECIO, verificar pedidos asociados
    if (input.precio && input.precio !== productoExistente.precio) {
      const { total_pedidos, pedidos_activos } = await repository.countPedidosAsociados(Number(id));
      
      // Actualizar el producto
      const updatedProducto = await repository.update(id, input);

      let mensaje = 'Producto modificado exitosamente';
      
      if (pedidos_activos > 0) {
        mensaje += `. AVISO: Hay ${pedidos_activos} pedidos activos que mantendrán el precio anterior ($${productoExistente.precio}).`;
      } else if (total_pedidos > 0) {
        mensaje += `. NOTA: ${total_pedidos} pedidos antiguos mantienen el precio anterior ($${productoExistente.precio}).`;
      }
      
      return res.status(200).send({ 
        message: mensaje,
        data: updatedProducto,
        info: {
          precio_anterior: productoExistente.precio,
          precio_nuevo: input.precio,
          pedidos_afectados: total_pedidos
        }
      });
    } else {
      // Actualización normal (sin cambio de precio crítico)
      const updatedProducto = await repository.update(id, input);
      return res.status(200).send({ 
        message: 'Producto modificado exitosamente',
        data: updatedProducto 
      });
    }

  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  const id = req.params.id;

  try {
    const eliminado = await repository.delete({ id });
    if (!eliminado) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    if (eliminado.activo === false) {
      return res.json({
        message: 'No se puede eliminar el producto porque tiene pedidos asociados. Se marcó como inactivo.',
        data: eliminado
      });
    }

    return res.json({
      message: 'Producto eliminado correctamente.',
      data: eliminado
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

async function findAllForAdmin(req: Request, res: Response) {
  const productos = await repository.findAllIncludeInactive();
  res.json({ data: productos });
}

async function reactivate(req: Request, res: Response) {
  const id = req.params.id;
  
  try {
    const producto = await repository.reactivate({ id });
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (producto.activo) {
      return res.status(200).json({ 
        message: 'El producto ya estaba activo.',
        data: producto
      });
    }
    
    return res.status(200).json({ 
      message: 'Producto reactivado exitosamente. Los clientes ya pueden verlo.',
      data: producto
    });
    
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

  async function findByTipo(req: Request, res: Response) {
  const idTipo = req.params.idTipo;
  
  if (!idTipo || isNaN(Number(idTipo))) {
    return res.status(400).json({ message: 'ID de tipo de producto inválido' });
  }

  try {
    const productos = await repository.findByTipoProducto(Number(idTipo));

    if (!productos || productos.length === 0) {
      return res.status(404).json({ 
        message: 'No se encontraron productos para este tipo',
        id_tipo: idTipo
      });
    }

    res.json({ 
      data: productos,
      total: productos.length,
      id_tipo: idTipo
    });
    } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { 
  sanitizeProductoInput, 
  findAll,        // Sólo activos
  findRandom,     // Buscar aleatorio
  findOne,      // Buscar por ID
  findByName,   // Buscar por nombre
  findByTipo,   // Buscar por tipo de producto
  add, 
  update, 
  remove,     // Soft/hard delete automático
  findAllForAdmin,   // Todos (para admin)
  reactivate      // Reactivar productos
};