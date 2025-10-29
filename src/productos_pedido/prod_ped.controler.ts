import { Request, Response, NextFunction } from "express";
import { ProductosPedidoRepository } from "./prod_ped.repository.js";
import { ProductosPedido } from "../models/prod_ped.model.js";
import { Producto } from "../models/producto.model.js"; 
import { Pedido } from "../models/pedido.model.js";

const repository = new ProductosPedidoRepository();

function sanitizeProductosPedidoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    cantidad: req.body.cantidad,
    precio_unitario: req.body.precio_unitario,
    precio_parcial: req.body.precio_parcial, // AGREGAR ESTA LÍNEA
    id_producto: req.body.id_producto,
    id_pedido: req.body.id_pedido
  };

  // Elimina campos undefined
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

//obtener todos los productos pedidos
async function findAll(req: Request, res: Response) {
  try {
    const productosPedidos = await repository.findAll();
    res.json({ data: productosPedidos || [] });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Error al obtener productos_pedido" });
  }
}

// 📊 VER PRODUCTOS DE UN PEDIDO (principal funcionalidad e-commerce)
async function findByPedido(req: Request, res: Response) {
  const id_pedido = Number.parseInt(req.params.id_pedido);
  
  if (isNaN(id_pedido)) {
    return res.status(400).json({ message: 'ID de pedido inválido' });
  }

  try {
    // El repository devuelve un OBJETO, no un array
    const resultado = await repository.findByPedido(id_pedido);
    
    if (!resultado || !resultado.productos || resultado.productos.length === 0) {
      return res.status(404).json({ 
        message: 'No se encontraron productos para este pedido',
        data: {
          id_pedido: id_pedido,
          productos: [],
          total_productos: 0,
          cantidad_total: 0,
          total_pedido: 0
        }
      });
    }
    // Ya viene calculado desde el repository
    res.json({ 
      data: resultado.productos,
      resumen: {
        id_pedido: resultado.id_pedido,
        total_productos: resultado.total_productos,
        cantidad_total: resultado.cantidad_total,
        total_pedido: Number(resultado.total_pedido) // Asegurar que sea número
      }
    });
  } catch (error: any) {
    console.error('Error en findByPedido:', error);
    res.status(500).json({ message: error.message || "Error al obtener productos del pedido" });
  }
}

// 🔍 VER UNO ESPECÍFICO (por clave compuesta)
async function findOne(req: Request, res: Response) {
  const id_pedido = Number.parseInt(req.params.id_pedido);
  const id_producto = Number.parseInt(req.params.id_producto);

  try {
    // ✅ CORREGIDO - Usar método correcto:
    const producto = await repository.findByPedidoYProducto(id_pedido, id_producto);
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto en pedido no encontrado' });
    }

    res.json({ data: producto });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput;

  // Validaciones básicas
  if (!input.id_pedido || !input.id_producto || !input.cantidad || input.cantidad <= 0) {
    return res.status(400).json({ 
      message: 'ID pedido, ID producto y cantidad (>0) son requeridos' 
    });
  }

  try {
    // Buscar el producto para obtener el precio actual
    const producto = await Producto.findByPk(input.id_producto);
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const cantidad = Number(input.cantidad);
    const precio_unitario = Number(producto.precio);
    const precio_parcial = cantidad * precio_unitario;

    // Pasa un objeto plano al repository
    const creado = await repository.add({
      id_pedido: Number(input.id_pedido),
      id_producto: Number(input.id_producto),
      cantidad,
      precio_unitario,
      precio_parcial
    });

    if (!creado) {
      return res.status(500).json({ message: "No se pudo crear el producto en el pedido" });
    }

    // Recalcular el total del pedido
    const productos = await repository.findByPedido(creado.id_pedido);
    const nuevoTotal = productos.productos.reduce(
      (sum: number, p: any) => sum + (Number(p.precio_parcial) || 0),
      0
    );

    // Actualizar el total en la tabla pedido
    await Pedido.update(
      { total_pedido: nuevoTotal },
      { where: { id_pedido: creado.id_pedido } }
    );

    // Devuelve la respuesta aquí, donde nuevoTotal está definido
    return res.status(201).json({ 
      message: "Producto agregado al pedido exitosamente", 
      data: creado,
      total_pedido_actualizado: nuevoTotal
    });

  } catch (error: any) {
    res.status(400).json({ message: error.message || "Error al agregar producto al pedido" });
  }
}

async function update(req: Request, res: Response) {
  const id_pedido = Number.parseInt(req.params.id_pedido);
  const id_producto = Number.parseInt(req.params.id_producto);
  const { cantidad } = req.body;

  if (!cantidad || cantidad <= 0) {
    return res.status(400).json({ message: 'Cantidad debe ser mayor a 0' });
  }

  try {
    const actualizado = await repository.updateByPedidoYProducto(id_pedido, id_producto, { cantidad });
    
    if (!actualizado) {
      return res.status(404).json({ message: 'Producto en pedido no encontrado' });
    }


    // Recalcular el total del pedido
    const productos = await repository.findByPedido(id_pedido);
    const nuevoTotal = productos.productos.reduce(
      (sum: number, p: any) => sum + (Number(p.precio_parcial) || 0),
      0
    );

    // Actualizar el total en la tabla pedido
    await Pedido.update(
      { total_pedido: nuevoTotal },
      { where: { id_pedido } }
    );

    res.json({ 
      message: 'Cantidad actualizada exitosamente',
      data: actualizado,
      total_pedido_actualizado: nuevoTotal
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

// Eliminar producto de un pedido
async function remove(req: Request, res: Response) {
  const id_pedido = Number.parseInt(req.params.id_pedido);
  const id_producto = Number.parseInt(req.params.id_producto);

  try {
    // 1. Elimina el producto del pedido
    const eliminado = await repository.deleteByPedidoYProducto(id_pedido, id_producto);
    if (!eliminado) {
      return res.status(404).json({ message: 'Producto en pedido no encontrado' });
    }

    // 2. Busca los productos restantes en el pedido
    const productos = await repository.findByPedido(id_pedido);

    // 3. Calcula el nuevo total (si no hay productos, será 0)
    const nuevoTotal = (productos.productos ?? []).reduce(
      (sum: number, p: any) => sum + (Number(p.precio_parcial) || 0),
      0
    );

    // 4. Actualiza el total en la tabla pedido
    await Pedido.update(
      { total_pedido: nuevoTotal },
      { where: { id_pedido } }
    );

    res.json({ 
      message: 'Producto eliminado del pedido exitosamente',
      data: eliminado,
      total_pedido_actualizado: nuevoTotal
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export { 
  sanitizeProductosPedidoInput, 
  findAll, 
  findByPedido,    // ← Funcionalidad principal
  findOne, 
  add, 
  update, 
  remove
};