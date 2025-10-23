import { Router } from "express";
import { validateToken, isAdmin } from "../middleware/token.js";
import { 
  sanitizePedidoInput, 
  findAll, 
  findOne, 
  findByFecha, 
  findByEmail, 
  getMisPedidos, 
  add, 
  createFromCart, 
  updateEstado, 
  remove, 
  obtenerPreciosProductos, 
  marcarComoEntregado 
} from "./pedido.controler.js";

export const pedidoRouter = Router()

// RUTAS ESPECÍFICAS PRIMERO:
pedidoRouter.get('/buscar-fecha', validateToken, isAdmin, findByFecha)
pedidoRouter.get('/buscar-email', validateToken, isAdmin, findByEmail)
pedidoRouter.get('/mis-pedidos', validateToken, getMisPedidos)

// RUTAS SIN LOGIN:
pedidoRouter.post('/precios', obtenerPreciosProductos)

// RUTAS CON LOGIN - USUARIOS:
pedidoRouter.post('/crear-desde-carrito', validateToken, createFromCart)

// RUTAS CON LOGIN - ADMIN (SIN /pedido duplicado):
pedidoRouter.get('/', validateToken, isAdmin, findAll);                    // Ver todos
pedidoRouter.get('/:id', validateToken, isAdmin, findOne);                 // Ver uno
pedidoRouter.post('/', validateToken, isAdmin, sanitizePedidoInput, add);  // Crear
pedidoRouter.put('/:id/estado', validateToken, isAdmin, updateEstado);     // Cambiar estado
pedidoRouter.put('/:id/entregar', validateToken, isAdmin, marcarComoEntregado); // Marcar entregado
pedidoRouter.delete('/:id', validateToken, isAdmin, remove);               // Eliminar