import bcrypt from 'bcrypt';
import { generateToken } from "../middleware/token.js"
import { Request, Response, NextFunction } from "express"
import { UsuarioRepository } from "./usuario.repository.js"

const repository = new UsuarioRepository()

function sanitizeUsuarioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    user_usuario: req.body.user_usuario,
    contraseña: req.body.contraseña,
    email_usuario: req.body.email_usuario,
    tel_usuario: req.body.tel_usuario,
    direccion_usuario: req.body.direccion_usuario,
    nombre_usuario: req.body.nombre_usuario,
    apellido_usuario: req.body.apellido_usuario,
    tipo_usuario: req.body.tipo_usuario,

  }

  // Elimina campos undefined
   Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

// VALIDACIÓN DE CAMPOS OBLIGATORIOS Y TIPOS ---
function validateUsuarioInput(input: any): string | null {
  if (!input.user_usuario || typeof input.user_usuario !== 'string' || input.user_usuario.trim() === '') {
    return 'El user del usuario es obligatorio.';
  }
  if (!input.contraseña || typeof input.contraseña !== 'string' || input.contraseña.trim() === '') {
    return 'La contraseña es obligatoria.';
  }
  if (!input.email_usuario || typeof input.email_usuario !== 'string' || input.email_usuario.trim() === '') {
    return 'El email del usuario es obligatorio.';
  }
  if (input.tel_usuario === undefined || typeof input.tel_usuario !== 'number') {
    return 'El teléfono del usuario es obligatorio y debe ser numérico.';
  }
  if (!input.direccion_usuario || typeof input.direccion_usuario !== 'string' || input.direccion_usuario.trim() === '') {
    return 'La dirección del usuario es obligatoria.';
  }
  if (!input.nombre_usuario || typeof input.nombre_usuario !== 'string' || input.nombre_usuario.trim() === '') {
    return 'El nombre del usuario es obligatorio.';
  }
  if (!input.apellido_usuario || typeof input.apellido_usuario !== 'string' || input.apellido_usuario.trim() === '') {
    return 'El apellido del usuario es obligatorio.';
  }
  if (input.tipo_usuario !== undefined && typeof input.tipo_usuario !== 'number') {
    return 'El tipo de usuario debe ser numérico.';
  }
  return null;
}

async function findAll(req: Request, res: Response) {
  const usuarios = await repository.findAll();
  const usuariosSinPassword = usuarios?.map(u => {
    const { contraseña, ...rest } = u.toJSON();
    return rest;
  });
  res.json({ data: usuariosSinPassword });
}

async function findOne(req: Request, res: Response) {
  const id = req.params.id;
  const usuario = await repository.findOne({ id });
  if (!usuario) {
    return res.status(404).send({ message: 'Usuario no encontrado' });
  }
  // No enviar la contraseña
  const { contraseña, ...usuarioSinPassword } = usuario.toJSON();
  res.json({ data: usuarioSinPassword });
}

async function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput;
  const error = validateUsuarioInput(input);
  if (error) {
    return res.status(400).send({ message: error });
  }

  // Validar que no exista un usuario con el mismo email
  const existemail = await repository.findOneByEmail(input.email_usuario);
  if (existemail) {
    return res.status(409).send({ message: 'Ya existe un usuario con ese email.' });
  }
  // Validar que no exista un usuario con el mismo user
  const existeuser = await repository.findOneByUser(input.user_usuario);
  if (existeuser) {
    return res.status(409).send({ message: 'Ya existe un usuario con ese user.' });
  }

  try {
    const usuario = await repository.add(input);
    // No enviar la contraseña ni los datos internos de Sequelize
    const { contraseña, ...usuarioSinPassword } = usuario!.toJSON();
    return res.status(201).send({ message: 'Usuario creado exitosamente', data: usuarioSinPassword });
  } catch (error: any) {
    return res.status(400).send({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  const id = req.params.id;
  const input = req.body.sanitizedInput;

  // Validar que el usuario exista antes de modificar
  const usuarioActual = await repository.findOne({ id });
  if (!usuarioActual) {
    return res.status(404).send({ message: 'Usuario no encontrado' });
  }

  // Evitar actualizaciones vacías
  if (!input || Object.keys(input).length === 0) {
    return res.status(400).send({ message: 'No se enviaron campos para modificar.' });
  }

  // Validar SOLO los campos que se envían
  if (input.user_usuario !== undefined && (typeof input.user_usuario !== 'string' || input.user_usuario.trim() === '')) {
    return res.status(400).send({ message: 'El usuario debe ser texto no vacío.' });
  }
  if (input.contraseña !== undefined && (typeof input.contraseña !== 'string' || input.contraseña.trim() === '')) {
    return res.status(400).send({ message: 'La contraseña debe ser texto no vacío.' });
  }
  if (input.email_usuario !== undefined && (typeof input.email_usuario !== 'string' || input.email_usuario.trim() === '')) {
    return res.status(400).send({ message: 'El email debe ser texto no vacío.' });
  }
  if (input.tel_usuario !== undefined && typeof input.tel_usuario !== 'number') {
    return res.status(400).send({ message: 'El teléfono debe ser numérico.' });
  }
  if (input.direccion_usuario !== undefined && (typeof input.direccion_usuario !== 'string' || input.direccion_usuario.trim() === '')) {
    return res.status(400).send({ message: 'La dirección debe ser texto no vacío.' });
  }
  if (input.nombre_usuario !== undefined && (typeof input.nombre_usuario !== 'string' || input.nombre_usuario.trim() === '')) {
    return res.status(400).send({ message: 'El nombre debe ser texto no vacío.' });
  }
  if (input.apellido_usuario !== undefined && (typeof input.apellido_usuario !== 'string' || input.apellido_usuario.trim() === '')) {
    return res.status(400).send({ message: 'El apellido debe ser texto no vacío.' });
  }
  if (input.tipo_usuario !== undefined && typeof input.tipo_usuario !== 'number') {
    return res.status(400).send({ message: 'El tipo de usuario debe ser numérico.' });
  }

  // Validar que el nuevo user no esté duplicado
  if (input.user_usuario && input.user_usuario !== usuarioActual.user_usuario) {
    const existeuser = await repository.findOneByUser(input.user_usuario);
    if (existeuser) {
      return res.status(409).send({ message: 'Ya existe un usuario con ese nombre de usuario.' });
    }
  }
  // Validar que el nuevo email no esté duplicado
  if (input.email_usuario && input.email_usuario !== usuarioActual.email_usuario) {
    const existeEmail = await repository.findOneByEmail(input.email_usuario);
    if (existeEmail) {
      return res.status(409).send({ message: 'Ya existe un usuario con ese email.' });
    }
  }

  try {
    const usuario = await repository.update(id, input);
    const { contraseña, ...usuarioSinPassword } = usuario!.toJSON();
    return res.status(200).send({ message: 'Usuario modificado exitosamente', data: usuarioSinPassword });
  } catch (error: any) {
    return res.status(400).send({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  const id = req.params.id;
  // Validar que el usuario exista antes de borrar
  const usuarioActual = await repository.findOne({ id });
  if (!usuarioActual) {
    return res.status(404).send({ message: 'Usuario no encontrado' });
  }
  try {
    await repository.delete({ id });
    return res.status(200).send({ message: 'Usuario eliminado exitosamente' });
  } catch (error: any) {
    // Si el error es por pedidos asociados, muestra el mensaje del repository
    return res.status(400).send({ message: error.message });
  }
}

async function loginUser(req: Request, res: Response) {
  const { user_usuario, contraseña } = req.body;

  // Validar datos obligatorios
  if (!user_usuario || !contraseña) {
    return res.status(400).send({ message: 'Usuario y contraseña son obligatorios' });
  }

  try {
    const user = await repository.findOneByUser(user_usuario);
    if (user && await bcrypt.compare(contraseña, user.contraseña)) {
      const payload = {
        id: user.id_usuario!,
        user_usuario: user.user_usuario,
        tipo_usuario: Number(user.tipo_usuario),
      };

      const token = generateToken(payload);

      // No enviar la contraseña
      const { contraseña: _, ...userSinPassword } = user!.toJSON();

      res.json({
        message: 'Login exitoso',
        token,
        user: userSinPassword
      });
    } else {
      res.status(401).send({ message: 'Usuario o contraseña incorrectos' });
    }
  } catch {
    res.status(500).send({ message: 'Error en el servidor' });
  }
}

export { sanitizeUsuarioInput, findAll, findOne, add, update, remove, loginUser };

