import { Repository } from "../shared/repository.js";
import { TipoProducto } from "./tipoproducto.entity.js";
import { pool } from '../shared/db/conn.mysql.js'
import { ResultSetHeader, RowDataPacket } from 'mysql2'


export class TipoProductoRepository implements Repository<TipoProducto>{
   public async findAll(): Promise<TipoProducto[] | undefined> {
    const [tiposproductos] = await pool.query('select * from tipo_producto ORDER BY nombre_tipo ASC')

    return tiposproductos as TipoProducto[];
  }

  public async findOne(item: { id: string }): Promise<TipoProducto | undefined> {
    const id = Number.parseInt(item.id)
    const [tiposproductos] = await pool.query<RowDataPacket[]>('select * from tipo_producto where idtipo_producto = ?', [id])
    if (tiposproductos.length === 0) {
      return undefined
    }
    return tiposproductos[0] as TipoProducto
  }

  // En tipoproducto.repository.ts
public async findByName(nombre: string): Promise<TipoProducto | undefined> {
  const [tiposproductos] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM tipo_producto WHERE LOWER(nombre_tipo) = LOWER(?)', 
    [nombre.trim()]
  );
  
  if (tiposproductos.length === 0) {
    return undefined;
  }
  return tiposproductos[0] as TipoProducto;
}

  public async  add(item: TipoProducto): Promise<TipoProducto | undefined> {
    const {id, desc_tipo, ...rest } = item
      const itemRow = {
  nombre_tipo: item.nombre_tipo,
  ...(item.desc_tipo ? { desc_tipo: item.desc_tipo } : {})
};

    const [result] = await pool.query<ResultSetHeader>('insert into tipo_producto set ?', [itemRow])
    item.id = result.insertId
    return item
  }

public async update(id: string, item: Partial<TipoProducto>): Promise<TipoProducto | undefined> {
  const tipoProductoId = Number.parseInt(id) //convierte el id en numero
  const fields = []
  const values = []

  if (item.nombre_tipo !== undefined) {
    fields.push('nombre_tipo = ?')
    values.push(item.nombre_tipo)
  }
  if (item.desc_tipo !== undefined) {
    fields.push('desc_tipo = ?')
    values.push(item.desc_tipo)
  }

  if (fields.length === 0) return await this.findOne({ id }) // Nada que actualizar

  await pool.query(
    `UPDATE tipo_producto SET ${fields.join(', ')} WHERE idtipo_producto = ?`,
    [...values, tipoProductoId]
  )

  return await this.findOne({ id })
}


public async delete(item: { id: string }): Promise<TipoProducto | undefined> {
  try {
    // PRIMERO: Obtener el tipo de producto antes de eliminarlo
    const tipoProductoToDelete = await this.findOne(item);
    if (!tipoProductoToDelete) {
      return undefined; // No existe
    }
    
    // VALIDAR: Verificar si tiene productos asociados
    const tipoProductoId = Number.parseInt(item.id);
    const [productos] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM producto WHERE id_tipoprod = ?', 
      [tipoProductoId]
    );
    
    const productosAsociados = (productos[0] as any).count;
    if (productosAsociados > 0) {
      throw new Error(`No se puede eliminar: existen ${productosAsociados} producto(s) asociado(s) a este tipo`);
    }
    
    // ELIMINAR: Si no hay productos asociados
    await pool.query('DELETE FROM tipo_producto WHERE idtipo_producto = ?', [tipoProductoId]);
    return tipoProductoToDelete;
    
  } catch (error: any) {
    // Manejar errores específicos de BD
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new Error('No se puede eliminar: existen productos asociados a este tipo');
    }
    throw error; // Re-lanzar el error original
  }
}
}


