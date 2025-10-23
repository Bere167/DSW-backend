import { Repository } from "../shared/repository.js";
import { Pedido } from "./pedido.entity.js";
import { pool } from '../shared/db/conn.mysql.js'
import { ResultSetHeader, RowDataPacket } from 'mysql2'

export class PedidoRepository implements Repository<Pedido> {
  
  public async findAll(): Promise<Pedido[] | undefined> {
    const [pedidos] = await pool.query<RowDataPacket[]>(`
      SELECT 
      p.id_pedido,
      p.fecha_pedido,
      p.total_pedido,
      p.estado_pedido,
      p.id_usuario,
      u.email_usuario,
      u.nombre_usuario,
      GROUP_CONCAT(
        CONCAT(prod.nombre_prod, '(', pp.cantidad, ')')
        ORDER BY prod.nombre_prod
        SEPARATOR ', '
      ) as productos
    FROM pedido p 
    JOIN usuario u ON p.id_usuario = u.id_usuario 
    LEFT JOIN productos_pedido pp ON p.id_pedido = pp.id_pedido
    LEFT JOIN producto prod ON pp.id_producto = prod.idproducto
    GROUP BY p.id_pedido, p.fecha_pedido, p.total_pedido, p.estado_pedido, p.id_usuario, u.email_usuario, u.nombre_usuario
    ORDER BY p.fecha_pedido DESC`);

    return pedidos as Pedido[];
  }

  // Mantener findOne original (por si lo necesitas para otras operaciones)
  public async findOne(item: { id: string }): Promise<Pedido | undefined> {
    const id = item.id;
    const [pedidos] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM pedido WHERE id_pedido = ?', 
      [id]
    );
    if (pedidos.length === 0) return undefined;
    return pedidos[0] as Pedido;
  }

  // AGREGAR: Búsqueda por fecha (más útil para admin)
// ...existing code...

public async findByFecha(fecha: string): Promise<Pedido[] | undefined> {

  const [pedidos] = await pool.query<RowDataPacket[]>(`
    SELECT 
      p.id_pedido,
      p.fecha_pedido,
      p.total_pedido,
      p.estado_pedido,
      p.id_usuario,
      u.email_usuario,
      u.nombre_usuario,
      GROUP_CONCAT(
        CONCAT(prod.nombre_prod, '(', pp.cantidad, ')')
        ORDER BY prod.nombre_prod
        SEPARATOR ', '
      ) as productos
    FROM pedido p 
    JOIN usuario u ON p.id_usuario = u.id_usuario 
    LEFT JOIN productos_pedido pp ON p.id_pedido = pp.id_pedido
    LEFT JOIN producto prod ON pp.id_producto = prod.idproducto
    WHERE DATE(p.fecha_pedido) = ?
    GROUP BY p.id_pedido, p.fecha_pedido, p.total_pedido, p.estado_pedido, p.id_usuario, u.email_usuario, u.nombre_usuario
    ORDER BY p.fecha_pedido DESC
  `, [fecha]);
  
  return pedidos as Pedido[];
}


  // AGREGAR: Búsqueda por email (útil para admin)
  public async findByEmail(email: string): Promise<Pedido[] | undefined> {
    const [pedidos] = await pool.query<RowDataPacket[]>(`
      SELECT 
        p.id_pedido,
        p.fecha_pedido,
        p.total_pedido,
        p.estado_pedido,
        p.id_usuario,
        u.email_usuario,
        u.nombre_usuario,
        GROUP_CONCAT(
          CONCAT(prod.nombre_prod, '(', pp.cantidad, ')')
          ORDER BY prod.nombre_prod
          SEPARATOR ', '
        ) as productos
      FROM pedido p 
      JOIN usuario u ON p.id_usuario = u.id_usuario 
      LEFT JOIN productos_pedido pp ON p.id_pedido = pp.id_pedido
      LEFT JOIN producto prod ON pp.id_producto = prod.idproducto
      WHERE u.email_usuario LIKE ?
      GROUP BY p.id_pedido, p.fecha_pedido, p.total_pedido, p.estado_pedido, p.id_usuario, u.email_usuario, u.nombre_usuario
      ORDER BY p.fecha_pedido DESC
    `, [`%${email}%`]);
    
    return pedidos as Pedido[];
  }

  public async findByUsuario(idUsuario: number): Promise<Pedido[] | undefined> {
    const [pedidos] = await pool.query<RowDataPacket[]>(`
      SELECT 
        p.id_pedido,
        p.fecha_pedido,
        p.total_pedido,
        p.estado_pedido,
        p.id_usuario,
        GROUP_CONCAT(
          CONCAT(prod.nombre_prod, '(', pp.cantidad, ')')
          ORDER BY prod.nombre_prod
          SEPARATOR ', '
        ) as productos
      FROM pedido p 
      LEFT JOIN productos_pedido pp ON p.id_pedido = pp.id_pedido
      LEFT JOIN producto prod ON pp.id_producto = prod.idproducto
      WHERE p.id_usuario = ?
      GROUP BY p.id_pedido, p.fecha_pedido, p.total_pedido, p.estado_pedido, p.id_usuario
      ORDER BY p.fecha_pedido DESC
    `, [idUsuario]);
    
    return pedidos as Pedido[];
  }

  public async add(item: Pedido): Promise<Pedido | undefined> {
    // Validación rápida de usuario
    if (!(await this.usuarioExists(item.id_usuario))) {
      throw new Error('Usuario no encontrado. Vuelve a iniciar sesión.');
    }
    
    const {id_pedido, ...rest } = item;
    const itemRow = {
      fecha_pedido: item.fecha_pedido,
      estado_pedido: item.estado_pedido,
      total_pedido: item.total_pedido,
      id_usuario: item.id_usuario
    };

    const [result] = await pool.query<ResultSetHeader>('INSERT INTO pedido SET ?', [itemRow]);
    item.id_pedido = result.insertId;
    return item;
  }
  
  private async usuarioExists(idUsuario: number): Promise<boolean> {
    const [result] = await pool.query<RowDataPacket[]>(
      'SELECT 1 FROM usuario WHERE id_usuario = ? LIMIT 1',
      [idUsuario]
    );
    return result.length > 0;
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

// AGREGAR al final de la clase PedidoRepository, antes de la llave final:

// Método para crear pedido completo desde carrito
public async crearDesdeCarrito(idUsuario: number, items: any[]): Promise<any> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    let totalPedido = 0;
    const itemsValidados = [];
    
    // VALIDAR cada producto y calcular total REAL
    for (const item of items) {
      // Verificar que el producto existe y obtener precio real
      const [producto] = await connection.query<RowDataPacket[]>(
        'SELECT idproducto, nombre_prod, precio, cant_stock, activo FROM producto WHERE idproducto = ?',
        [item.id_producto]
      );
      
      if (producto.length === 0) {
        throw new Error(`Producto ${item.id_producto} no encontrado`);
      }
      
      const prod = producto[0];

      if (!prod.activo) {
      throw new Error(`El producto "${prod.nombre_prod}" no está disponible actualmente`);
      }
      
      // Verificar stock disponible
      if (prod.cant_stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${prod.nombre_prod}. Disponible: ${prod.cant_stock}, solicitado: ${item.cantidad}`);
      }
      
      // Calcular con precio REAL de la BD (no del frontend)
      const precioReal = Number(prod.precio);
      const subtotal = precioReal * Number(item.cantidad);

      totalPedido += subtotal;
      
      itemsValidados.push({
        id_producto: item.id_producto,
        cantidad: Number(item.cantidad),          
        precio_unitario: precioReal,                 
        precio_parcial: subtotal, 
        nombre: prod.nombre_prod
});
    }
    
    // 2. Crear pedido principal con total CALCULADO
    const [pedidoResult] = await connection.query<ResultSetHeader>(
      'INSERT INTO pedido (id_usuario, estado_pedido, total_pedido, fecha_pedido) VALUES (?, "pendiente", ?, NOW())',
      [idUsuario, Number(totalPedido)]
    );
    
    const idPedido = pedidoResult.insertId;
    
    // 3. Agregar cada producto al pedido Y descontar stock
    for (const item of itemsValidados) {
      // Insertar en productos_pedido
      await connection.query(
        `INSERT INTO productos_pedido 
        (id_pedido, id_producto, cantidad, precio_unitario, precio_parcial) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          idPedido, 
          item.id_producto, 
          item.cantidad, 
          item.precio_unitario,
          item.precio_parcial   
  ]
);
      
      // Descontar stock del producto
      await connection.query(
        'UPDATE producto SET cant_stock = cant_stock - ? WHERE idproducto = ?',
        [item.cantidad, item.id_producto]
      );
    }
    
    await connection.commit();
    const finalTotal = parseFloat(totalPedido.toString());
    // 4. Devolver resumen del pedido
    return {
  id_pedido: idPedido,
  id_usuario: idUsuario,
  estado_pedido: 'pendiente',
  total_pedido: finalTotal,
  fecha_pedido: new Date(),
  items: itemsValidados,
  resumen: {
    id_pedido: idPedido,
    total_productos: itemsValidados.length,
    cantidad_total: itemsValidados.reduce((sum, item) => sum + item.cantidad, 0),
    total_pedido: finalTotal
  }
  };

    
  } catch (error: any) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}


public async delete(item: { id: string }): Promise<Pedido | undefined> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Obtener el pedido antes de eliminarlo
    const pedidoToDelete = await this.findOne(item);
    if (!pedidoToDelete) {
      return undefined;
    }
    
    const pedidoId = Number.parseInt(item.id);
    
    // 2. RESTAURAR STOCK solo si NO está entregado
    if (pedidoToDelete.estado_pedido.toLowerCase() !== 'entregado') {
      const [productos] = await connection.query<RowDataPacket[]>(
        `SELECT pp.id_producto, pp.cantidad 
        FROM productos_pedido pp 
        WHERE pp.id_pedido = ?`,
        [pedidoId]
      );
      
      // Devolver stock a cada producto
      for (const prod of productos as any[]) {
        await connection.query(
          'UPDATE producto SET cant_stock = cant_stock + ? WHERE idproducto = ?',
          [prod.cantidad, prod.id_producto]
        );
      }
    }
    
    // ELIMINAR productos asociados primero
    await connection.query('DELETE FROM productos_pedido WHERE id_pedido = ?', [pedidoId]);
    
    // ELIMINAR el pedido
    await connection.query('DELETE FROM pedido WHERE id_pedido = ?', [pedidoId]);
    
    await connection.commit();
    return pedidoToDelete;

  } catch (error: any) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
}


