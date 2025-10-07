import { Router } from "express";
import { sanitizeProductosPedidoInput, findAll, findByPedido, add, getCantidadTotal } from "./prod_ped.controler.js";
import { validateToken, isAdmin } from "../middleware/token.js";

export const productospedidoRouter = Router();

productospedidoRouter.get("/", validateToken, isAdmin, findAll);
productospedidoRouter.get("/:id_pedido", validateToken, isAdmin, findByPedido);
productospedidoRouter.post("/", validateToken, isAdmin, sanitizeProductosPedidoInput, add);
productospedidoRouter.get("/cantidad_total", validateToken, isAdmin, getCantidadTotal);
