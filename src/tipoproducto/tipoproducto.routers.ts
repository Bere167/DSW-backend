import { Router } from "express";
import { sanitizeTipoProductoInput, findAll, findOne, add, update, remove } from "./tipoproducto.controler.js";

export const tipoproductoRouter = Router()

tipoproductoRouter.get('/', findAll)
tipoproductoRouter.get('/:id', findOne)
tipoproductoRouter.post('/', sanitizeTipoProductoInput, add)
tipoproductoRouter.put('/:id', sanitizeTipoProductoInput, update)
tipoproductoRouter.patch('/:id', sanitizeTipoProductoInput, update)
tipoproductoRouter.delete('/:id', remove)