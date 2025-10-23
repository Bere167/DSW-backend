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
productosPedidoRouter.get('/productos-pedido/pedido/:id_pedido', validateToken, findByPedido);

// RUTAS ADMIN
productosPedidoRouter.get('/productos-pedido', validateToken, isAdmin, findAll);
productosPedidoRouter.get('/productos-pedido/:id_pedido/producto/:id_producto', validateToken, isAdmin, findOne);
productosPedidoRouter.post('/productos-pedido', validateToken, isAdmin, sanitizeProductosPedidoInput, add);
productosPedidoRouter.put('/productos-pedido/:id_pedido/producto/:id_producto', validateToken, isAdmin, update);
productosPedidoRouter.delete('/productos-pedido/:id_pedido/producto/:id_producto', validateToken, isAdmin, remove);