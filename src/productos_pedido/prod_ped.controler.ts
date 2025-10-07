import { Request, Response, NextFunction } from "express";
import { ProductosPedidoRepository } from "./prod_ped.repository.js";
import { ProductosPedido } from "./prod_ped.entity.js";

const repository = new ProductosPedidoRepository();

function sanitizeProductosPedidoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    cantidad: req.body.cantidad,
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

/*obtener todos los productos pedidos*/
async function findAll(req: Request, res: Response) {
  try {
    const productosPedidos = await repository.findAll();
    res.status(200).json(productosPedidos);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Error al obtener los productos pedidos" });
  }
}
async function findByPedido(req: Request, res: Response) {
  const id_pedido = req.params.id_pedido;
  try {
    const productos = await repository.findByPedido(id_pedido);
    res.status(200).json(productos);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Error al obtener los productos de este pedido" });
  }
}
async function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput;
  try {
    const nuevoProductoPedido = new ProductosPedido(
      input.cantidad,
      input.id_producto,
      input.id_pedido
    );
    const creado = await repository.add(nuevoProductoPedido);
    res.status(201).json({ message: "Producto agregado al pedido", data: creado });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Error al agregar producto al pedido" });
  }
}

async function getCantidadTotal(req: Request, res: Response) {
  try {
    const total = await repository.getCantidadTotal();
    if (total === 0) {
      return res.json({ message: "No hay productos vendidos" });
    }
    res.json({ cantidad_total: total });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Error al obtener la cantidad total de productos pedidos" });
  }
}

export { sanitizeProductosPedidoInput, findAll, findByPedido, add, getCantidadTotal };