import { Router } from "express";
import { sanitizePedidoInput, findAll, findOne, add, updateEstado, remove } from "./pedido.controler.js";
import { validateToken, isAdmin } from "../middleware/token.js";

export const pedidoRouter = Router()
pedidoRouter.get('/pedido', findAll)
pedidoRouter.get('/pedido/:id', findOne)
pedidoRouter.post('/pedido', validateToken, sanitizePedidoInput, add)
pedidoRouter.put('/pedido/:id', validateToken, isAdmin, sanitizePedidoInput, updateEstado)
pedidoRouter.delete('/pedido/:id', validateToken, isAdmin, remove)