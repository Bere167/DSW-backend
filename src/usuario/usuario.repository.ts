import { Repository } from "../shared/repository.js";
import { Usuario } from "./usuario.entity.js";
import { pool } from '../shared/db/conn.mysql.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class UsuarioRepository implements Repository<Usuario> {
  public async findAll(): Promise<Usuario[] | undefined> {
    const [usuarios] = await pool.query('SELECT * FROM usuario ORDER BY apellido_usuario ASC');
    return usuarios as Usuario[];
  }

  public async findOne(item: { id: string }): Promise<Usuario | undefined> {
    const id = Number.parseInt(item.id);
    const [usuarios] = await pool.query<RowDataPacket[]>('SELECT * FROM usuario WHERE id_usuario = ?', [id]);
    if (usuarios.length === 0) {
      return undefined;
    }
    return usuarios[0] as Usuario;
  }

  public async findOneByEmail(item: { email: string }): Promise<Usuario | undefined> {
    const email = String(item.email);
    const [usuarios] = await pool.query<RowDataPacket[]>('SELECT * FROM usuario WHERE email_usuario = ?', [email]);
    if (usuarios.length === 0) {
      return undefined;
    }
    return usuarios[0] as Usuario;
  }

   public async findOneByUser(item: { user: string }): Promise<Usuario | undefined> {
    const user = String(item.user);
    const [usuarios] = await pool.query<RowDataPacket[]>('SELECT * FROM usuario WHERE user_usuario = ?', [user]);
    if (usuarios.length === 0) {
      return undefined;
    }
    return usuarios[0] as Usuario;
  }
  

  public async add(item: Usuario): Promise<Usuario | undefined> {
    const itemRow = {
      nombre_usuario: item.nombre_usuario,
      email_usuario: item.email_usuario,
      tel_usuario: item.tel_usuario,
      apellido_usuario: item.apellido_usuario,
      direccion_usuario: item.direccion_usuario,
      tipo_usuario: item.tipo_usuario,
      user_usuario: item.user_usuario,
      contraseña: item.contraseña
    };

    const [result] = await pool.query<ResultSetHeader>('INSERT INTO usuario SET ?', [itemRow]);
    item.id_usuario = result.insertId;
    return item;
  }

  public async update(id: string, item: Partial<Usuario>): Promise<Usuario | undefined> {
    const usuarioId = Number.parseInt(id);

      // Validar que el usuario exista
      const usuarioActual = await this.findOne({ id });
      if (!usuarioActual) {
        throw new Error('Usuario no encontrado');
      }
  
      const fields = [];
      const values = [];
  
      if (item.nombre_usuario !== undefined) {
        fields.push('nombre_usuario = ?');
        values.push(item.nombre_usuario);
      }
      if (item.email_usuario !== undefined) {
        fields.push('email_usuario = ?');
        values.push(item.email_usuario);
      }
      if (item.tel_usuario !== undefined) {
        fields.push('tel_usuario = ?');
        values.push(item.tel_usuario);
      }
      if (item.apellido_usuario !== undefined) {
        fields.push('apellido_usuario = ?');
        values.push(item.apellido_usuario);
      }
      if (item.direccion_usuario !== undefined) {
        fields.push('direccion_usuario = ?');
        values.push(item.direccion_usuario);
      }
      if (item.tipo_usuario !== undefined) {
        fields.push('tipo_usuario = ?');
        values.push(item.tipo_usuario);
      }
      if (item.user_usuario !== undefined) {
        fields.push('user_usuario = ?');
        values.push(item.user_usuario);
      }
      if (item.contraseña !== undefined) {
        fields.push('contraseña = ?');
        values.push(item.contraseña);
      }

      if (fields.length === 0) return await this.findOne({ id }); // Nada que actualizar

      await pool.query(
        `UPDATE usuario SET ${fields.join(', ')} WHERE id_usuario = ?`,
        [...values, usuarioId]
      );

      return await this.findOne({ id });
    }

    public async delete(item: { id: string }): Promise<Usuario | undefined> {
        try {
          const usuarioToDelete = await this.findOne(item);
          const usuarioId = Number.parseInt(item.id);
          await pool.query('DELETE FROM usuario WHERE id_usuario = ?', [usuarioId]);
          return usuarioToDelete;
        } catch (error: any) {
          throw new Error('No se puede eliminar el usuario');
        }
      }
  }
