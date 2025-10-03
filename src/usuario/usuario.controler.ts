import { generateToken } from "../middleware/token.js"
import { Request, Response, NextFunction } from "express"
import { UsuarioRepository } from "./usuario.repository.js"
import { Usuario } from "./usuario.entity.js"

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

// --- VALIDACIÓN DE CAMPOS OBLIGATORIOS Y TIPOS ---
function validateUsuarioInput(input: any): string | null {
  if (!input.user_usuario || typeof input.user_usuario !== 'string') {
    return 'El user del usuario es obligatorio.';
  }
  if (input.contraseña === undefined || typeof input.contraseña !== 'string') {
    return 'La contraseña es obligatoria.';
  }
  if (input.email_usuario === undefined || typeof input.email_usuario !== 'string') {
    return 'El email del usuario es obligatorio y debe ser texto.';
  }
  if (input.tel_usuario === undefined || typeof input.tel_usuario !== 'number') {
    return 'El teléfono del usuario es obligatorio y debe ser numérico.';
  }
  if (input.direccion_usuario === undefined || typeof input.direccion_usuario !== 'string') {
    return 'La dirección del usuario es obligatoria y debe ser texto.';
  }
  if (input.tipo_usuario === undefined || typeof input.tipo_usuario !== 'string') {
    return 'El tipo de usuario es obligatorio y debe ser un texto.';
  }
  if (input.nombre_usuario !== undefined && (typeof input.nombre_usuario !== 'string' || input.nombre_usuario.trim() === '')) {
    return 'El nombre del usuario es obligatorio y debe ser texto.';
  }
  if (input.apellido_usuario !== undefined && (typeof input.apellido_usuario !== 'string' || input.apellido_usuario.trim() === '')) {
    return 'El apellido del usuario es obligatorio y debe ser texto.';
  }
  return null;
}


async function findAll(req: Request, res: Response) {
  res.json({ data: await repository.findAll() });
}

async function findOne(req: Request, res: Response) {
  const id = req.params.id_usuario;
  const usuario = await repository.findOne({ id });
  if (!usuario) {
    return res.status(404).send({ message: 'Usuario no encontrado' });
  }
  res.json({ data: usuario });
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

  const usuarioInput = new Usuario(
    "", // Assuming empty string for id_usuario
    input.nombre_usuario,
    input.apellido_usuario,
    input.email_usuario,
    input.telefono_usuario,
    input.direccion_usuario,
    input.tipo_usuario,
    input.user_usuario,
    input.contraseña,
  );

   try {
    const usuario = await repository.add(usuarioInput);
    return res.status(201).send({ message: 'Usuario creado exitosamente', data: usuario });
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

    // Validar tipos y valores solo para los campos enviados
    if (!input.user_usuario || typeof input.user_usuario !== 'string') {
    return 'El user del usuario es obligatorio.';
  }
  if (input.contraseña === undefined || typeof input.contraseña !== 'string') {
    return 'La contraseña es obligatoria.';
  }
  if (input.email_usuario === undefined || typeof input.email_usuario !== 'string') {
    return 'El email del usuario es obligatorio y debe ser texto.';
  }
  if (input.tel_usuario === undefined || typeof input.tel_usuario !== 'number') {
    return 'El teléfono del usuario es obligatorio y debe ser numérico.';
  }
  if (input.direccion_usuario === undefined || typeof input.direccion_usuario !== 'string') {
    return 'La dirección del usuario es obligatoria y debe ser texto.';
  }
  if (input.tipo_usuario === undefined || typeof input.tipo_usuario !== 'string') {
    return 'El tipo de usuario es obligatorio y debe ser un texto.';
  }
  if (input.nombre_usuario !== undefined && (typeof input.nombre_usuario !== 'string' || input.nombre_usuario.trim() === '')) {
    return 'El nombre del usuario es obligatorio y debe ser texto.';
  }
  if (input.apellido_usuario !== undefined && (typeof input.apellido_usuario !== 'string' || input.apellido_usuario.trim() === '')) {
    return 'El apellido del usuario es obligatorio y debe ser texto.';
  }

    // Validar que el nuevo user no esté duplicado
  if (
    input.user_usuario !== undefined &&
    input.user_usuario !== usuarioActual.user_usuario
  ) {
    const existeuser = await repository.findOneByUser(input.user_usuario);
    if (existeuser && existeuser.user_usuario !== String(usuarioActual.user_usuario)) {
      return res.status(409).send({ message: 'Ya existe un usuario con ese nombre.' });
    }
  }

 /*   // Validar que el nuevo tipo de producto exista si se modifica
  if (
    input.id_tipoprod !== undefined &&
    input.id_tipoprod !== usuarioActual.id_tipoprod
  ) {
    if (!(await repository['tipoProductoExists'](input.id_tipoprod))) {
      return res.status(400).send({ message: 'El tipo de producto especificado no existe.' });
    }
  }
*/
  const usuario = await repository.update(id, req.body.sanitizedInput);
  return res.status(200).send({ message: 'Usuario modificado exitosamente', data: usuario });
}


async function remove(req: Request, res: Response) {
  const id = req.params.id;
  // Validar que el usuario exista antes de borrar
  const usuarioActual = await repository.findOne({ id });
  if (!usuarioActual) {
    return res.status(404).send({ message: 'Usuario no encontrado' });
  }
  await repository.delete({ id });
  return res.status(200).send({ message: 'Usuario borrado exitosamente' });
}

async function loginUser(req: Request, res: Response) {
  const user_usuario = req.body.user_usuario;
  const contraseña = req.body.contraseña;
  try {
    const user = await repository.findOneByUser({ user: user_usuario });
    if (user && user.contraseña === contraseña) {
      const payload = {
        id: user.id_usuario,
        nombre: user.nombre_usuario,
        tipo_usuario: Number(user.tipo_usuario), 
        user_usuario: user_usuario,
      };
      const token = generateToken(payload);
      res.json({ token, user });
    } else {
      res.status(404).send({ message: 'Usuario o contraseña incorrectos' });
    }
  } catch {
    res.status(404).send({ message: 'Error en el LogIn' });
  }
}

export { sanitizeUsuarioInput, findAll, findOne, add, update, remove, loginUser };

  
/*EJEMPLO DE DELETE CON ID Y VALIDACION DE PEDIDOS ASOCIADOS*/
  /*deleteUserById = async (req, res) => {
    const { id } = req.params
    try {
      const orders = await orderModel.findAll({
        where: {
          id_cliente: id,
        }
      });

      if (orders.length > 0) {
        return res.status(400).json({ message: 'No se puede eliminar el usuario, tiene pedidos asociados' });
      }
      const user = await this.userModel.destroy({
        where: {
          id_usuarios: id,
        },
      })
      if (user) {
        res.json({ message: 'Usuario eliminado correctamente' })
      } else {
        res.status(404).send({ message: 'Usuario no encontrado' })
      }
    } catch (error) {
      res.status(400).send({ message: 'Error al eliminar el usuario' })
    }

  }


  validateExistance = async (id, nombre_usuario, email) => {
    if (id === undefined) {
      id = 0
    }
    const user = await this.userModel.findOne({
      where: {
        nombre_usuario: nombre_usuario,
        id_usuarios: {
          [Op.not]: id
        }
      },
    });
    const mail = await this.userModel.findOne({
      where: {
        email: email,
        id_usuarios: {
          [Op.not]: id
        }
      },
    });
    if (user || mail) {
      return true
    } else {
      return false
    }

  }

  getClientsQuantity = async (req, res) => {
    const clients = await this.userModel.count({
      where: {
        tipo_usuario: 2,
      },
    })
    if (clients) {
      res.status(200).json(clients)
    }
    else {
      res.status(404).send(0)
    }
  }
}*/