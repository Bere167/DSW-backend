import { Repository } from "../shared/repository.js";
import { ProductosPedido } from "./prod_ped.entity.js";
import { pool } from '../shared/db/conn.mysql.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class ProductosPedidoRepository implements Repository<ProductosPedido> {

public async findAll(): Promise<ProductosPedido[] | undefined> {
  const [productos] = await pool.query<RowDataPacket[]>(`
    SELECT 
      pp.*,
      p.nombre_prod,
      ped.fecha_pedido,
      ped.estado_pedido
    FROM productos_pedido pp
    INNER JOIN producto p ON pp.id_producto = p.idproducto
    INNER JOIN pedido ped ON pp.id_pedido = ped.id_pedido
    ORDER BY pp.id_pedido DESC, pp.id_producto
  `);

  return productos.map(item => ({
    id: item.id,
    id_pedido: Number(item.id_pedido),
    id_producto: Number(item.id_producto),
    cantidad: Number(item.cantidad),
    precio_unitario: Number(item.precio_unitario),
    precio_parcial: Number(item.precio_parcial),
    nombre_prod: item.nombre_prod,
    fecha_pedido: item.fecha_pedido,
    estado_pedido: item.estado_pedido
  })) as ProductosPedido[];
}

  public async findOne(item: { id: string }): Promise<ProductosPedido | undefined> {
    const id = Number.parseInt(item.id);
    const [productos_pedido] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM productos_pedido WHERE id = ?',
      [id]
    );
    
    if (productos_pedido.length === 0) {
      return undefined;
    }
    return productos_pedido[0] as ProductosPedido;
  }

public async add(item: ProductosPedido): Promise<ProductosPedido | undefined> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO productos_pedido 
     (id_pedido, id_producto, cantidad, precio_unitario, precio_parcial) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      item.id_pedido,
      item.id_producto, 
      item.cantidad,
      Number(item.precio_unitario),
      Number(item.precio_parcial)
    ]
  );
  
  const newItem = { ...item, id: result.insertId };
  return newItem;
}

  public async update(id: string, item: Partial<ProductosPedido>): Promise<ProductosPedido | undefined> {
    const idNum = Number.parseInt(id);
    
    // Obtener datos actuales
    const actual = await this.findOne({ id });
    if (!actual) {
      throw new Error('Producto en pedido no encontrado');
    }

    if (item.cantidad !== undefined) {
      // Recalcular precio_parcial
      const nuevoPrecioParcial = item.cantidad * actual.precio_unitario;
      
      await pool.query(
        `UPDATE productos_pedido 
         SET cantidad = ?, precio_parcial = ? 
         WHERE id = ?`,
        [item.cantidad, nuevoPrecioParcial, idNum]
      );
    }

    return await this.findOne({ id });
  }

  public async delete(item: { id: string }): Promise<ProductosPedido | undefined> {
    const id = Number.parseInt(item.id);
    
    // Obtener datos antes de eliminar
    const productoAPedido = await this.findOne(item);
    if (!productoAPedido) {
      return undefined;
    }

    await pool.query('DELETE FROM productos_pedido WHERE id = ?', [id]);
    return productoAPedido;
  }


public async findByPedido(idPedido: number): Promise<any> {
  const [productos] = await pool.query<RowDataPacket[]>(`
    SELECT 
      pp.id_pedido,
      pp.id_producto,
      pp.cantidad,
      pp.precio_unitario,  -- Precio en el momento del pedido
      pp.precio_parcial,   -- Subtotal calculado
      p.nombre_prod,
      p.precio as precio_actual  -- Precio actual del producto
    FROM productos_pedido pp
    INNER JOIN producto p ON pp.id_producto = p.idproducto
    WHERE pp.id_pedido = ?
    ORDER BY pp.id_producto
  `, [idPedido]);

  if (productos.length === 0) {
    return { 
      id_pedido: idPedido, 
      productos: [],
      total_productos: 0,
      cantidad_total: 0,
      total_pedido: 0
    };
  }

  // SUMAR los precio_parcial (NO concatenar)
  const totalPedido = productos.reduce((sum, item) => {
    return sum + Number(item.precio_parcial || 0);
  }, 0);

  const cantidadTotal = productos.reduce((sum, item) => {
    return sum + Number(item.cantidad || 0);
  }, 0);

  return {
    id_pedido: Number(idPedido),
    total_productos: productos.length,
    cantidad_total: cantidadTotal,
    total_pedido: Number(totalPedido.toFixed(2)), // Asegurar 2 decimales
    productos: productos.map(item => ({
      id_producto: Number(item.id_producto),
      nombre_prod: item.nombre_prod,
      cantidad: Number(item.cantidad),
      precio_unitario: Number(item.precio_unitario),
      precio_parcial: Number(item.precio_parcial),
      precio_actual: Number(item.precio_actual) // Para comparar si cambió el precio
    }))
  };
}


  // Buscar por clave compuesta (para las rutas admin)
  public async findByPedidoYProducto(idPedido: number, idProducto: number): Promise<ProductosPedido | undefined> {
    const [productos_pedido] = await pool.query<RowDataPacket[]>(
      `SELECT pp.*, p.nombre_prod, p.desc_prod, p.imagen 
       FROM productos_pedido pp
       JOIN producto p ON pp.id_producto = p.idproducto
       WHERE pp.id_pedido = ? AND pp.id_producto = ?`,
      [idPedido, idProducto]
    );
    
    if (productos_pedido.length === 0) {
      return undefined;
    }
    return productos_pedido[0] as ProductosPedido;
  }

  // Actualizar por clave compuesta
  public async updateByPedidoYProducto(idPedido: number, idProducto: number, item: Partial<ProductosPedido>): Promise<ProductosPedido | undefined> {
    // Obtener datos actuales
    const actual = await this.findByPedidoYProducto(idPedido, idProducto);
    if (!actual) {
      throw new Error('Producto en pedido no encontrado');
    }

    if (item.cantidad !== undefined) {
      // Recalcular precio_parcial
      const nuevoPrecioParcial = item.cantidad * actual.precio_unitario;
      
      await pool.query(
        `UPDATE productos_pedido 
         SET cantidad = ?, precio_parcial = ? 
         WHERE id_pedido = ? AND id_producto = ?`,
        [item.cantidad, nuevoPrecioParcial, idPedido, idProducto]
      );
    }

    return await this.findByPedidoYProducto(idPedido, idProducto);
  }

  // 🗑️ Eliminar por clave compuesta
  public async deleteByPedidoYProducto(idPedido: number, idProducto: number): Promise<ProductosPedido | undefined> {
    // Obtener datos antes de eliminar
    const productoAPedido = await this.findByPedidoYProducto(idPedido, idProducto);
    if (!productoAPedido) {
      return undefined;
    }

    await pool.query(
      'DELETE FROM productos_pedido WHERE id_pedido = ? AND id_producto = ?', 
      [idPedido, idProducto]
    );

    return productoAPedido;
  }
}