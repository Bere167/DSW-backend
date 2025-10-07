import { Repository } from "../shared/repository.js";
import { ProductosPedido } from "./prod_ped.entity.js";
import { pool } from '../shared/db/conn.mysql.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class ProductosPedidoRepository implements Repository<ProductosPedido> {
  public async findAll(): Promise<ProductosPedido[] | undefined> {
    const [productos] = await pool.query('SELECT * FROM productos_pedido ORDER BY id_pedido ASC');
    return productos as ProductosPedido[];
  }

public async findByPedido(id_pedido: string): Promise<ProductosPedido[]> {
  const [rows] = await pool.query('SELECT * FROM productos_pedido WHERE id_pedido = ?', [Number(id_pedido)]);
  return rows as ProductosPedido[];
}

public async findOne(item: { id: string }): Promise<ProductosPedido | undefined> {
  // Expect id in the format "id_pedido-id_producto"
  const [id_pedido, id_producto] = item.id.split("-");
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM productos_pedido WHERE id_pedido = ? AND id_producto = ?',
    [Number(id_pedido), Number(id_producto)]
  );
  if ((rows as any[]).length === 0) return undefined;
  return rows[0] as ProductosPedido;
}

  public async add(item: ProductosPedido): Promise<ProductosPedido | undefined> {
    await pool.query<ResultSetHeader>(
      'INSERT INTO productos_pedido (cantidad, id_producto, id_pedido) VALUES (?, ?, ?)',
      [item.cantidad, item.id_producto, item.id_pedido]
    );
    return item;
  }

  public async update(id_pedido: string, item: ProductosPedido): Promise<ProductosPedido | undefined> {
  await pool.query<ResultSetHeader>(
    'UPDATE productos_pedido SET cantidad = ? WHERE id_pedido = ? AND id_producto = ?',
    [item.cantidad, Number(id_pedido), item.id_producto]
  );
  // Use the composite key as a string
  return this.findOne({ id: `${id_pedido}-${item.id_producto}` });
}

public async delete(item: { id: string }): Promise<ProductosPedido | undefined> {
  const prodPed = await this.findOne(item);
  if (!prodPed) return undefined;
  const [id_pedido, id_producto] = item.id.split("-");
  await pool.query<ResultSetHeader>(
    'DELETE FROM productos_pedido WHERE id_pedido = ? AND id_producto = ?',
    [Number(id_pedido), Number(id_producto)]
  );
  return prodPed;
}

  public async getCantidadTotal(): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT SUM(cantidad) AS total FROM productos_pedido'
    );
    return (rows as any)[0].total || 0;
  }
}