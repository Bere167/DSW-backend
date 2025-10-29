import { Repository } from "../shared/repository.js";
import { sequelize } from '../shared/db/sequelize.js';
import { Op } from 'sequelize';
import { Transaction } from 'sequelize';
import { Pedido } from '../models/pedido.model.js';
import { Usuario } from '../models/usuario.model.js';
import { ProductosPedido } from '../models/prod_ped.model.js';
import { Producto } from '../models/producto.model.js';

export class PedidoRepository implements Repository<Pedido> {
  
  public async findAll(): Promise<Pedido[] | undefined> {
  return await Pedido.findAll({
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id_usuario', 'email_usuario', 'nombre_usuario']
      },
      {
        model: ProductosPedido,
        as: 'productosPedido',
        include: [
          {
            model: Producto,
            as: 'producto',
            attributes: ['nombre_prod']
          }
        ]
      }
    ],
    order: [['fecha_pedido', 'DESC']]
  });
}

  // Mantener findOne original (por si lo necesitas para otras operaciones)
  public async findOne(item: { id: string }): Promise<Pedido | undefined> {
  const id = Number(item.id);
  const pedido = await Pedido.findByPk(id, {
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id_usuario', 'email_usuario', 'nombre_usuario']
      },
      {
        model: ProductosPedido,
        as: 'productosPedido',
        include: [
          {
            model: Producto,
            as: 'producto',
            attributes: ['nombre_prod']
          }
        ]
      }
    ]
  });
  return pedido || undefined;
}

  public async findByFecha(fecha: string): Promise<Pedido[] | undefined> {
  const start = new Date(`${fecha}T00:00:00`);
  const end = new Date(`${fecha}T23:59:59`);
  return await Pedido.findAll({
    where: {
      fecha_pedido: {
        [Op.between]: [start, end]
      }
    },
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id_usuario', 'email_usuario', 'nombre_usuario']
      },
      {
        model: ProductosPedido,
        as: 'productosPedido',
        include: [
          {
            model: Producto,
            as: 'producto',
            attributes: ['nombre_prod']
          }
        ]
      }
    ]
  });
}

  public async findByEmail(email: string): Promise<Pedido[] | undefined> {
  return await Pedido.findAll({
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id_usuario', 'email_usuario', 'nombre_usuario'],
        where: {
          email_usuario: {
            [Op.like]: `%${email}%`
          }
        }
      },
      {
        model: ProductosPedido,
        as: 'productosPedido',
        include: [
          {
            model: Producto,
            as: 'producto',
            attributes: ['nombre_prod']
          }
        ]
      }
    ],
    order: [['fecha_pedido', 'DESC']]
  });
}

  public async findByUsuario(idUsuario: number): Promise<Pedido[] | undefined> {
  return await Pedido.findAll({
    where: {
      id_usuario: idUsuario
    },
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id_usuario', 'email_usuario', 'nombre_usuario']
      },
      {
        model: ProductosPedido,
        as: 'productosPedido',
        include: [
          {
            model: Producto,
            as: 'producto',
            attributes: ['nombre_prod']
          }
        ]
      }
    ],
    order: [['fecha_pedido', 'DESC']]
  });
}

public async add(input: {
  id_usuario: number,
  productos: { id_producto: number, cantidad: number }[],
  estado_pedido?: string
}): Promise<Pedido> {
  return await sequelize.transaction(async (t: Transaction) => {
    // Validar usuario
    const usuario = await Usuario.findByPk(input.id_usuario, { transaction: t });
    if (!usuario) throw new Error('Usuario no encontrado');

    // Validar productos y stock
    let total = 0;
    const productosValidados: { producto: Producto, cantidad: number }[] = [];
    for (const item of input.productos) {
      const producto = await Producto.findByPk(item.id_producto, { transaction: t });
      if (!producto || !producto.activo) throw new Error(`Producto no disponible (ID: ${item.id_producto})`);

      if (producto.cant_stock == null || producto.cant_stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre_prod}`);
      }
      total += producto.precio * item.cantidad;
      productosValidados.push({ producto, cantidad: item.cantidad });
    }

    // Crear pedido
    const pedido = await Pedido.create({
      id_usuario: input.id_usuario,
      estado_pedido: input.estado_pedido ?? 'pendiente',
      fecha_pedido: new Date(),
      total_pedido: total
    }, { transaction: t });

    // Crear productos_pedido y descontar stock
    for (const { producto, cantidad } of productosValidados) {
      await ProductosPedido.create({
        id_pedido: pedido.id_pedido,
        id_producto: producto.idproducto,
        cantidad,
        precio_unitario: producto.precio,
        precio_parcial: producto.precio * cantidad
      }, { transaction: t });
      await producto.decrement('cant_stock', { by: cantidad, transaction: t });
    }

    // Traer el pedido con los productos asociados para la respuesta
    const pedidoCompleto = await Pedido.findByPk(pedido.id_pedido, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id_usuario', 'email_usuario', 'nombre_usuario']
        },
        {
          model: ProductosPedido,
          as: 'productosPedido',
          include: [
            {
              model: Producto,
              as: 'producto',
              attributes: ['nombre_prod']
            }
          ]
        }
      ],
      transaction: t
    });

    return pedidoCompleto!;
  });
}

public async update(id: string, item: Pedido): Promise<Pedido | undefined> {
  // Solo permitimos actualizar el estado
  if (!item.estado_pedido) {
    throw new Error("Solo se permite actualizar el estado del pedido.");
  }
  const pedido = await Pedido.findByPk(Number(id));
  if (!pedido) return undefined;

  pedido.estado_pedido = item.estado_pedido;
  await pedido.save();

  const pedidoActualizado = await Pedido.findByPk(Number(id), {
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id_usuario', 'email_usuario', 'nombre_usuario']
      },
      {
        model: ProductosPedido,
        as: 'productosPedido',
        include: [
          {
            model: Producto,
            as: 'producto',
            attributes: ['nombre_prod']
          }
        ]
      }
    ]
  });

  return pedidoActualizado || undefined;
}

// Método para crear pedido completo desde carrito
public async crearDesdeCarrito(idUsuario: number, items: { id_producto: number, cantidad: number }[]): Promise<Pedido> {
  return await sequelize.transaction(async (t: Transaction) => {
    // Validar usuario
    const usuario = await Usuario.findByPk(idUsuario, { transaction: t });
    if (!usuario) throw new Error('Usuario no encontrado');

    // Validar productos y stock
    let totalPedido = 0;
    const productosValidados: { producto: Producto, cantidad: number }[] = [];
    for (const item of items) {
      const producto = await Producto.findByPk(item.id_producto, { transaction: t });
      if (!producto || !producto.activo) throw new Error(`Producto no disponible (ID: ${item.id_producto})`);
      if (producto.cant_stock == null || producto.cant_stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre_prod}`);
      }
      totalPedido += producto.precio * item.cantidad;
      productosValidados.push({ producto, cantidad: item.cantidad });
    }

    // Crear pedido
    const pedido = await Pedido.create({
      id_usuario: idUsuario,
      estado_pedido: 'pendiente',
      fecha_pedido: new Date(),
      total_pedido: totalPedido
    }, { transaction: t });

    // Crear productos_pedido y descontar stock
    for (const { producto, cantidad } of productosValidados) {
      await ProductosPedido.create({
        id_pedido: pedido.id_pedido,
        id_producto: producto.idproducto,
        cantidad,
        precio_unitario: producto.precio,
        precio_parcial: producto.precio * cantidad
      }, { transaction: t });
      await producto.decrement('cant_stock', { by: cantidad, transaction: t });
    }

    // Traer el pedido con los productos asociados para la respuesta
    const pedidoCompleto = await Pedido.findByPk(pedido.id_pedido, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id_usuario', 'email_usuario', 'nombre_usuario']
        },
        {
          model: ProductosPedido,
          as: 'productosPedido',
          include: [
            {
              model: Producto,
              as: 'producto',
              attributes: ['nombre_prod']
            }
          ]
        }
      ],
      transaction: t
    });

    return pedidoCompleto!;
  });
}

public async delete(item: { id: string }): Promise<Pedido | undefined> {
  return await sequelize.transaction(async (t: Transaction) => {
    // Buscar el pedido con productos asociados
    const pedido = await Pedido.findByPk(Number(item.id), {
      include: [
        {
          model: ProductosPedido,
          as: 'productosPedido',
          include: [{ model: Producto, as: 'producto' }]
        }
      ],
      transaction: t
    });
    if (!pedido) return undefined;

    // Si el pedido NO está entregado, restaurar stock
    if (pedido.estado_pedido.toLowerCase() !== 'entregado') {
      for (const pp of pedido.productosPedido ?? []) {
        if (pp.producto) {
          await pp.producto.increment('cant_stock', { by: pp.cantidad, transaction: t });
        }
      }
    }

    // Eliminar productos_pedido asociados
    await ProductosPedido.destroy({
      where: { id_pedido: pedido.id_pedido },
      transaction: t
    });

    // Eliminar el pedido
    await Pedido.destroy({
      where: { id_pedido: pedido.id_pedido },
      transaction: t
    });

    return pedido;
  });
}
}


