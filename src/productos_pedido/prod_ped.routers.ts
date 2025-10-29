import { Router } from "express";
import { 
  sanitizeProductosPedidoInput,
  findAll, 
  findByPedido, 
  findOne, 
  add, 
  update, 
  remove
} from "./prod_ped.controler.js";
import { validateToken, isAdmin } from "../middleware/token.js";

export const productosPedidoRouter = Router();

// RUTA PRINCIPAL - Ver productos de un pedido
// Usuarios pueden ver SUS pedidos, admin puede ver cualquiera
productosPedidoRouter.get('/:id_pedido', validateToken, findByPedido);

// RUTAS ADMIN
productosPedidoRouter.get('/', validateToken, isAdmin, findAll);
productosPedidoRouter.get('/:id_pedido/:id_producto', validateToken, isAdmin, findOne);
productosPedidoRouter.post('/', validateToken, isAdmin, sanitizeProductosPedidoInput, add);
productosPedidoRouter.put('/:id_pedido/:id_producto', validateToken, isAdmin, update);
productosPedidoRouter.delete('/:id_pedido/:id_producto', validateToken, isAdmin, remove);