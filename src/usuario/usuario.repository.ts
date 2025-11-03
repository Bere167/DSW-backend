import bcrypt from 'bcrypt';
import { Repository } from "../shared/repository.js";
import { Usuario } from '../models/usuario.model.js';
import { Pedido } from '../models/pedido.model.js';

export class UsuarioRepository implements Repository<Usuario> {
  public async findAll(): Promise<Usuario[] | undefined> {
    return await Usuario.findAll({
      order: [['apellido_usuario', 'ASC']]
    });
  }


  public async findOne(item: { id: string }): Promise<Usuario | undefined> {
  const id = Number.parseInt(item.id);
  const usuario = await Usuario.findByPk(id);
  return usuario || undefined;
}
  

  public async findOneByEmail(email_usuario: string): Promise<Usuario | undefined> {
  const usuario = await Usuario.findOne({
    where: { email_usuario: email_usuario.trim() }
  });
  return usuario || undefined;
}

  public async findOneByUser(user_usuario: string): Promise<Usuario | undefined> {
  const usuario = await Usuario.findOne({
    where: { user_usuario: user_usuario.trim() }
  });
  return usuario || undefined;
}
  

  public async add(item: Usuario): Promise<Usuario | undefined> {
  // Validar que el nombre de usuario no exista
  const existenteUser = await Usuario.findOne({ where: { user_usuario: item.user_usuario.trim() } });
  if (existenteUser) {
    throw new Error('Ya existe un usuario con ese nombre de usuario');
  }

  // Validar que el email no exista
  const existenteEmail = await Usuario.findOne({ where: { email_usuario: item.email_usuario.trim() } });
  if (existenteEmail) {
    throw new Error('Ya existe un usuario con ese email');
  }

   // Hashear la contraseña antes de guardar
  const hash = await bcrypt.hash(item.contraseña, 10);

  // Crear el usuario
  const nuevo = await Usuario.create({
    user_usuario: item.user_usuario.trim(),
    contraseña: hash, // Guardar el hash, no la contraseña original
    email_usuario: item.email_usuario.trim(),
    tel_usuario: item.tel_usuario,
    direccion_usuario: item.direccion_usuario,
    nombre_usuario: item.nombre_usuario,
    apellido_usuario: item.apellido_usuario,
    tipo_usuario: item.tipo_usuario ?? 2 // Por defecto cliente
  });

  return nuevo;
}

  public async update(id: string, item: Partial<Usuario>): Promise<Usuario | undefined> {
  const usuarioId = Number.parseInt(id);

  // Validar que el usuario exista
  const usuarioActual = await this.findOne({ id });
  if (!usuarioActual) { throw new Error('Usuario no encontrado'); }

  // Validar que el nuevo nombre de usuario no exista (si se cambia)
  if (
    item.user_usuario &&
    item.user_usuario.trim() !== usuarioActual.user_usuario
  ) {
    const existenteUser = await Usuario.findOne({
      where: { user_usuario: item.user_usuario.trim() }
    });
    if (existenteUser && existenteUser.id_usuario !== usuarioId) {
      throw new Error('Ya existe un usuario con ese nombre de usuario');
    }
  }

  // Validar que el nuevo email no exista (si se cambia)
  if (
    item.email_usuario &&
    item.email_usuario.trim() !== usuarioActual.email_usuario
  ) {
    const existenteEmail = await Usuario.findOne({
      where: { email_usuario: item.email_usuario.trim() }
    });
    if (existenteEmail && existenteEmail.id_usuario !== usuarioId) {
      throw new Error('Ya existe un usuario con ese email');
    }
  }

  // Solo actualizar la contraseña si viene y no es string vacío
if (
  item.contraseña !== undefined &&
  typeof item.contraseña === 'string' &&
  item.contraseña.trim() !== ''
) {
  item.contraseña = await bcrypt.hash(item.contraseña, 10);
} else {
  // Si viene vacía o undefined, no la actualices
  delete item.contraseña;
}

  // Actualizar solo los campos enviados
  await usuarioActual.update(item);
  return usuarioActual;
}

public async delete(item: { id: string }): Promise<Usuario | undefined> {
  const usuarioToDelete = await this.findOne(item);
  if (!usuarioToDelete) return undefined;

  // Verificar si tiene pedidos asociados
  const pedidosAsociados = await Pedido.count({
    where: { id_usuario: usuarioToDelete.id_usuario }
  });

  if (pedidosAsociados > 0) {
    throw new Error('No se puede eliminar el usuario porque tiene pedidos asociados.');
  }

  // Eliminar físicamente
  await usuarioToDelete.destroy();
  return usuarioToDelete;
}
}