import { Repository } from "../shared/repository.js";
import { ProductosPedido } from "../models/prod_ped.model.js";
import { Producto } from "../models/producto.model.js";
import { Pedido } from "../models/pedido.model.js";

export class ProductosPedidoRepository implements Repository<ProductosPedido> {

public async findAll(): Promise<ProductosPedido[] | undefined> {
  const productos = await ProductosPedido.findAll({
    include: [
      {
        model: Producto,
        as: 'producto',
        attributes: ['nombre_prod']
      },
      {
        model: Pedido,
        as: 'pedido',
        attributes: ['fecha_pedido', 'estado_pedido']
      }
    ],
    order: [
      ['id_pedido', 'DESC'],
      ['id_producto', 'ASC']
    ]
  });
  return productos.map(pp => ({
    id: pp.id,
    id_pedido: pp.id_pedido,
    id_producto: pp.id_producto,
    cantidad: pp.cantidad,
    precio_unitario: pp.precio_unitario,
    precio_parcial: pp.precio_parcial,
    nombre_prod: pp.producto?.nombre_prod,
    fecha_pedido: pp.pedido?.fecha_pedido,
    estado_pedido: pp.pedido?.estado_pedido
  })) as any;
}

public async findOne(item: { id: string }): Promise<ProductosPedido | undefined> {
  const prodPed = await ProductosPedido.findByPk(Number(item.id), {
    include: [
      { model: Producto, as: 'producto' },
      { model: Pedido, as: 'pedido' }
    ]
  });
  return prodPed || undefined;
}

public async add(item: {
  cantidad: number;
  precio_unitario: number;
  precio_parcial: number;
  id_producto: number;
  id_pedido: number;
}): Promise<ProductosPedido | undefined> {
  // Crea el registro usando Sequelize
  const creado = await ProductosPedido.create({
    id_pedido: item.id_pedido,
    id_producto: item.id_producto,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    precio_parcial: item.precio_parcial
  });

  // Trae el registro recién creado con los datos relacionados
  return await ProductosPedido.findByPk(creado.id, {
    include: [
      { model: Producto, as: 'producto', attributes: ['nombre_prod'] },
      { model: Pedido, as: 'pedido', attributes: ['fecha_pedido', 'estado_pedido'] }
    ]
  }) || undefined;
}

  public async update(id: string, item: Partial<ProductosPedido>): Promise<ProductosPedido | undefined> {
    const prodPed = await ProductosPedido.findByPk(Number(id));
    if (!prodPed) throw new Error('Producto en pedido no encontrado');

    if (item.cantidad !== undefined) {
      prodPed.cantidad = item.cantidad;
      prodPed.precio_parcial = item.cantidad * prodPed.precio_unitario;
    }
    await prodPed.save();

    return await ProductosPedido.findByPk(Number(id), {
      include: [
        { model: Producto, as: 'producto', attributes: ['nombre_prod'] },
        { model: Pedido, as: 'pedido', attributes: ['fecha_pedido', 'estado_pedido'] }
      ]
    }) || undefined;
  }

  public async delete(item: { id: string }): Promise<ProductosPedido | undefined> {
    const prodPed = await ProductosPedido.findByPk(Number(item.id), {
      include: [
        { model: Producto, as: 'producto', attributes: ['nombre_prod'] },
        { model: Pedido, as: 'pedido', attributes: ['fecha_pedido', 'estado_pedido'] }
      ]
    });
    if (!prodPed) return undefined;
    await prodPed.destroy();
    return prodPed;
  }

  public async findByPedido(idPedido: number): Promise<any> {
    const productos = await ProductosPedido.findAll({
      where: { id_pedido: idPedido },
      include: [
        { model: Producto, as: 'producto', attributes: ['nombre_prod', 'precio'] }
      ],
      order: [['id_producto', 'ASC']]
    });

    if (productos.length === 0) {
      return {
        id_pedido: idPedido,
        productos: [],
        total_productos: 0,
        cantidad_total: 0,
        total_pedido: 0
      };
    }

const totalPedido = productos.reduce((sum, pp) => sum + (Number(pp.precio_parcial) || 0), 0);
const cantidadTotal = productos.reduce((sum, pp) => sum + (Number(pp.cantidad) || 0), 0);

return {
  id_pedido: idPedido,
  total_productos: productos.length,
  cantidad_total: cantidadTotal,
  total_pedido: Number(totalPedido.toFixed(2)),
  productos: productos.map(pp => ({
    id_producto: pp.id_producto,
    nombre_prod: pp.producto?.nombre_prod ?? '',
    cantidad: pp.cantidad,
    precio_unitario: pp.precio_unitario,
    precio_parcial: pp.precio_parcial,
    precio_actual: pp.producto?.precio ?? null
  }))
};
  }

  public async findByPedidoYProducto(idPedido: number, idProducto: number): Promise<ProductosPedido | undefined> {
    const prodPed = await ProductosPedido.findOne({
      where: { id_pedido: idPedido, id_producto: idProducto },
      include: [
        { model: Producto, as: 'producto' }
      ]
    });
    return prodPed || undefined;
  }

  public async updateByPedidoYProducto(idPedido: number, idProducto: number, item: Partial<ProductosPedido>): Promise<ProductosPedido | undefined> {
    const prodPed = await ProductosPedido.findOne({
      where: { id_pedido: idPedido, id_producto: idProducto }
    });
    if (!prodPed) throw new Error('Producto en pedido no encontrado');

    if (item.cantidad !== undefined) {
      prodPed.cantidad = item.cantidad;
      prodPed.precio_parcial = item.cantidad * prodPed.precio_unitario;
    }
    await prodPed.save();

    return await ProductosPedido.findOne({
      where: { id_pedido: idPedido, id_producto: idProducto },
      include: [
        { model: Producto, as: 'producto' }
      ]
    }) || undefined;
  }

  public async deleteByPedidoYProducto(idPedido: number, idProducto: number): Promise<ProductosPedido | undefined> {
    const prodPed = await ProductosPedido.findOne({
      where: { id_pedido: idPedido, id_producto: idProducto },
      include: [
        { model: Producto, as: 'producto' }
      ]
    });
    if (!prodPed) return undefined;
    await prodPed.destroy();
    return prodPed;
  }
}