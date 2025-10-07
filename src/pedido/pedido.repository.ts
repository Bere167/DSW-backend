import { Repository } from "../shared/repository.js";
import { Pedido } from "./pedido.entity.js";
import { pool } from '../shared/db/conn.mysql.js'
import { ResultSetHeader, RowDataPacket } from 'mysql2'

export class PedidoRepository implements Repository<Pedido>{
   public async findAll(): Promise<Pedido[] | undefined> {
    const [pedidos] = await pool.query('select * from pedido ORDER BY fecha_pedido ASC')

    return pedidos as Pedido[];
  }

  public async findOne(item: { id:string }): Promise<Pedido | undefined> {
    const id = item.id
    const [pedidos] = await pool.query<RowDataPacket[]>('select * from pedido where id_pedido = ?', [id])
    if (pedidos.length === 0) {
      return undefined
    }
    return pedidos[0] as Pedido
  }

  public async  add(item: Pedido): Promise<Pedido | undefined> {
    const {id_pedido, ...rest } = item
      const itemRow = {
  fecha_pedido: item.fecha_pedido,
  estado_pedido: item.estado_pedido,
  total_pedido: item.total_pedido,
  id_usuario: item.id_usuario
};

    const [result] = await pool.query<ResultSetHeader>('insert into pedido set ?', [itemRow])
    item.id_pedido = result.insertId
    return item
  }
/*solo se pone para que se pueda implementar correctamente la interfaz, pero no se usa*/
  public async update(id: string, item: Pedido): Promise<Pedido | undefined> {
  // Solo permitimos actualizar el estado, para cualquier otro campo lanzamos error
  if (item.estado_pedido) {
    return this.updateEstado(Number(item.id_pedido), item.estado_pedido);
  }
  throw new Error("Solo se permite actualizar el estado del pedido.");
}

async updateEstado(id: number, estado_pedido: string): Promise<Pedido | undefined> {
  await pool.query(
    'UPDATE pedido SET estado_pedido = ? WHERE id_pedido = ?',
    [estado_pedido, id]
  );
  const [rows] = await pool.query('SELECT * FROM pedido WHERE id_pedido = ?', [id]);
  return (rows as Pedido[])[0];
}

public async delete(item: { id: string }): Promise<Pedido | undefined> {
  try {
    // PRIMERO: Obtener el pedido antes de eliminarlo
    const pedidoToDelete = await this.findOne(item);
    if (!pedidoToDelete) {
      return undefined; // No existe
    }
    
    // VALIDAR: Solo permitir eliminar si el estado es "entregado"
    if (pedidoToDelete.estado_pedido !== "entregado") {
      throw new Error('Solo se puede eliminar un pedido con estado "entregado".');
    }

    // VALIDAR: Verificar si tiene productos asociados
    const pedidoId = Number.parseInt(item.id);
    const [productos] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM producto WHERE id_pedido = ?', 
      [pedidoId]
    );

    const productosAsociados = (productos[0] as any).count;
    if (productosAsociados > 0) {
      throw new Error(`No se puede eliminar: existen ${productosAsociados} producto(s) asociado(s) a este pedido`);
    }
     // ELIMINAR: Si no hay productos asociados y el estado es "entregado"
    await pool.query('DELETE FROM pedido WHERE id_pedido = ?', [pedidoId]);
    return pedidoToDelete;

  } catch (error: any) {
    // Manejar errores específicos de BD
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new Error('No se puede eliminar: existen productos asociados a este pedido');
    }
    throw error; 
  }
  }
}


