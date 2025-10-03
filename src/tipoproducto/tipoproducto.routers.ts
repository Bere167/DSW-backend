import { Router } from "express";
import { sanitizeTipoProductoInput, findAll, findOne, add, update, remove } from "./tipoproducto.controler.js";
import { validateToken, isAdmin } from "../middleware/token.js";

export const tipoproductoRouter = Router()

//Rutas públicas (sin protección)
tipoproductoRouter.get('/', findAll)
tipoproductoRouter.get('/:id', findOne)

//Rutas protegidas (requieren estar logueado)

//Rutas protegidas (requieren ser admin)
tipoproductoRouter.post('/', validateToken, isAdmin, sanitizeTipoProductoInput, add)
tipoproductoRouter.put('/:id', validateToken, isAdmin, sanitizeTipoProductoInput, update)
tipoproductoRouter.patch('/:id', validateToken, isAdmin, sanitizeTipoProductoInput, update)
tipoproductoRouter.delete('/:id', validateToken, isAdmin, remove)