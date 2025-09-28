import { Repository } from "../shared/repository.js";
import { Producto } from "./producto.entity.js";
import { pool } from '../shared/db/conn.mysql.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class ProductoRepository implements Repository<Producto> {
  public async findAll(): Promise<Producto[] | undefined> {
    const [productos] = await pool.query('SELECT * FROM producto ORDER BY nombre_prod ASC');
    return productos as Producto[];
  }

  public async findOne(item: { id: string }): Promise<Producto | undefined> {
    const id = Number.parseInt(item.id);
    const [productos] = await pool.query<RowDataPacket[]>('SELECT * FROM producto WHERE idproducto = ?', [id]);
    if (productos.length === 0) {
      return undefined;
    }
    return productos[0] as Producto;
  }

public async findByName(nombre_prod: string): Promise<Producto | undefined> {
  const [productos] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM producto WHERE nombre_prod = ?',
    [nombre_prod]
  );
  if (productos.length === 0) return undefined;
  return productos[0] as Producto;
}

    private async tipoProductoExists(id_tipoprod: number): Promise<boolean> {
    const [result] = await pool.query<RowDataPacket[]>('SELECT 1 FROM tipo_producto WHERE idtipo_producto = ?', [id_tipoprod]);
    return result.length > 0;
  }


public async add(item: Producto): Promise<Producto | undefined> {
  // Validar que el tipo de producto exista
  if (!item.id_tipoprod || !(await this.tipoProductoExists(item.id_tipoprod))) {
    throw new Error('El tipo de producto especificado no existe');
  }

const itemRow = {
  nombre_prod: item.nombre_prod,
  precio: item.precio,
  desc_prod: item.desc_prod,
  cant_stock: item.cant_stock,
  imagen: item.imagen,
  id_tipoprod: item.id_tipoprod
};

  const [result] = await pool.query<ResultSetHeader>('INSERT INTO producto SET ?', [itemRow]);
  item.idproducto = result.insertId;
  return item;
}

  public async update(id: string, item: Partial<Producto>): Promise<Producto | undefined> {
    const productoId = Number.parseInt(id);
    
    // Validar que el producto exista
    const productoActual = await this.findOne({ id });
    if (!productoActual) {
      throw new Error('Producto no encontrado');
    }

    // Si se modifica el tipo de producto, validar que exista
    if (
      item.id_tipoprod !== undefined &&
      item.id_tipoprod !== productoActual.id_tipoprod
    ) {
      if (!(await this.tipoProductoExists(item.id_tipoprod))) {
        throw new Error('El tipo de producto especificado no existe');
      }
    }
    const fields = [];
    const values = [];

    if (item.nombre_prod !== undefined) {
      fields.push('nombre_prod = ?');
      values.push(item.nombre_prod);
    }
    if (item.precio !== undefined) {
      fields.push('precio = ?');
      values.push(item.precio);
    }
    if (item.desc_prod !== undefined) {
      fields.push('desc_prod = ?');
      values.push(item.desc_prod);
    }
    if (item.cant_stock !== undefined) {
      fields.push('cant_stock = ?');
      values.push(item.cant_stock);
    }
    if (item.imagen !== undefined) {
      fields.push('imagen = ?');
      values.push(item.imagen);
    }
    if (item.id_tipoprod !== undefined) {
      fields.push('id_tipoprod = ?');
      values.push(item.id_tipoprod);
    }

    if (fields.length === 0) return await this.findOne({ id }); // Nada que actualizar

    await pool.query(
      `UPDATE producto SET ${fields.join(', ')} WHERE idproducto = ?`,
      [...values, productoId]
    );

    return await this.findOne({ id });
  }

  public async delete(item: { id: string }): Promise<Producto | undefined> {
    try {
      const productoToDelete = await this.findOne(item);
      const productoId = Number.parseInt(item.id);
      await pool.query('DELETE FROM producto WHERE idproducto = ?', [productoId]);
      return productoToDelete;
    } catch (error: any) {
      throw new Error('No se puede eliminar el producto');
    }
  }
}