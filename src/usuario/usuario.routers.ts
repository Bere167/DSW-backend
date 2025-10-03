import { Router } from "express";
import { sanitizeUsuarioInput, findAll, findOne, add, update, remove, loginUser } from "./usuario.controler.js";
import { validateToken, isAdmin } from "../middleware/token.js";

export const usuarioRouter = Router();

// Rutas públicas (sin token)
usuarioRouter.post('/login', loginUser);           // LOGIN
usuarioRouter.post('/add', sanitizeUsuarioInput, add); // REGISTRO

// Rutas de usuario logueado (perfil propio) (no entendí para que son)
usuarioRouter.get('/profile', validateToken, (req, res) => {
  // Permite a cualquier usuario ver su propio perfil sin conocer su ID
  const userId = (req as any).user.id;
  req.params.id = userId.toString();
  findOne(req, res);
});

usuarioRouter.put('/profile', validateToken, sanitizeUsuarioInput, (req, res) => {
  const userId = (req as any).user.id;
  req.params.id = userId.toString();
  update(req, res);
});

// Rutas solo para administradores
usuarioRouter.get('/', validateToken, isAdmin, findAll);              // Ver todos
usuarioRouter.get('/:id', validateToken, isAdmin, findOne);           // Ver específico
usuarioRouter.put('/:id', validateToken, isAdmin, sanitizeUsuarioInput, update); // Editar cualquiera
usuarioRouter.delete('/:id', validateToken, isAdmin, remove);         // Eliminar