import { Router } from "express";
import { sanitizeProductoInput, findAll, findRandom, findOne, findByName, findByTipo, add, update, remove, findAllForAdmin, reactivate } from "./producto.controler.js";
import { validateToken, isAdmin } from "../middleware/token.js";

export const productoRouter = Router();

// RUTAS ESPECÍFICAS PRIMERO (para evitar conflictos):
productoRouter.get('/tipo/:idTipo', findByTipo);    
productoRouter.get('/random', findRandom);               // Buscar aleatorio
productoRouter.get('/todos', validateToken, isAdmin, findAllForAdmin);     // Admin: ver todos
productoRouter.get('/nombre/:nombre', findByName);                        // Buscar por nombre
productoRouter.put('/:id/reactivar', validateToken, isAdmin, reactivate); // Reactivar

// RUTAS PÚBLICAS:
productoRouter.get('/', findAll);              // Lista solo activos
productoRouter.get('/:id', findOne);           // Detalle de producto

// RUTAS ADMIN:
productoRouter.post('/', validateToken, isAdmin, sanitizeProductoInput, add);     // Crear
productoRouter.put('/:id', validateToken, isAdmin, sanitizeProductoInput, update); // Editar
productoRouter.patch('/:id', validateToken, isAdmin, sanitizeProductoInput, update); // Editar parcial
productoRouter.delete('/:id', validateToken, isAdmin, remove);                   // Eliminar/ocultar