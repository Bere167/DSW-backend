import { Repository } from "../shared/repository.js";
import { sequelize } from '../shared/db/sequelize.js';
import { TipoProducto } from '../models/tipoproducto.model.js';
import { Producto } from '../models/producto.model.js';
import { ProductosPedido } from '../models/prod_ped.model.js';


export class ProductoRepository implements Repository<Producto> {
  public async findAll(): Promise<Producto[] | undefined> {
  return await Producto.findAll({
    where: { activo: true },
    order: [['nombre_prod', 'ASC']]
  });
}

public async findRandom(cantidad: number): Promise<Producto[]> {
  return await Producto.findAll({
    where: { activo: true },
    order: sequelize.random(),
    limit: cantidad
  });
}

public async findOne(item: { id: string }): Promise<Producto | undefined> {
  const id = Number.parseInt(item.id);
  const producto = await Producto.findByPk(id);
  return producto || undefined;
}

public async findByName(nombre_prod: string): Promise<Producto | undefined> {
  const producto = await Producto.findOne({
    where: { nombre_prod: nombre_prod.trim(), activo: true }
  });
  return producto || undefined;
}

// método para admin ver TODOS (activos e inactivos):
public async findAllIncludeInactive(): Promise<any[] | undefined> {
  const productos = await Producto.findAll({
    order: [
      ['activo', 'DESC'],
      ['nombre_prod', 'ASC']
    ]
  });

  // Agregar el campo estado_texto según el valor booleano
  return productos.map(p => ({
    ...p.toJSON(),
    estado_texto: p.activo ? 'Activo' : 'Inactivo'
  }));
}

private async tipoProductoExists(id_tipoprod: number): Promise<boolean> {
  const tipo = await TipoProducto.findByPk(id_tipoprod);
  return !!tipo;
} //devuelve true si existe, false si no


public async add(item: Producto): Promise<Producto | undefined> {
  // Validar que el tipo de producto exista
  if (!item.id_tipoprod || !(await this.tipoProductoExists(item.id_tipoprod))) {
    throw new Error('El tipo de producto especificado no existe');
  }

  // Validar nombre único (opcional, si lo necesitas)
  const productoExistente = await Producto.findOne({
    where: { nombre_prod: item.nombre_prod.trim(), activo: true }
  });
  if (productoExistente) {
    throw new Error('Ya existe un producto con ese nombre');
  }

  // Crear el producto
  const nuevo = await Producto.create({
    nombre_prod: item.nombre_prod,
    precio: item.precio,
    desc_prod: item.desc_prod,
    cant_stock: item.cant_stock,
    imagen: item.imagen,
    id_tipoprod: item.id_tipoprod,
    activo: item.activo !== undefined ? item.activo : true
  });

  return nuevo;
}

public async countPedidosAsociados(id_producto: number): Promise<{ total_pedidos: number, pedidos_activos: number }> {
  // Busca todos los productos_pedido asociados a este producto
  const productosPedido = await ProductosPedido.findAll({
    where: { id_producto },
    include: [{
      association: 'pedido', // Asegúrate de definir la relación en el modelo si la necesitas
      attributes: ['estado_pedido']
    }]
  });

  let total_pedidos = productosPedido.length;
  let pedidos_activos = productosPedido.filter((pp: any) =>
    ['pendiente', 'confirmado', 'preparando'].includes(pp.pedido?.estado_pedido)
  ).length;

  return { total_pedidos, pedidos_activos };
}

public async update(id: string, item: Partial<Producto>): Promise<Producto | undefined> {
  const productoId = Number.parseInt(id);

  // Validar que el producto exista
  const productoActual = await Producto.findByPk(productoId);
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

  // Validar nombre único (opcional, si lo necesitas)
  if (
    item.nombre_prod &&
    item.nombre_prod.trim() !== productoActual.nombre_prod
  ) {
    const productoExistente = await Producto.findOne({
      where: {
        nombre_prod: item.nombre_prod.trim(),
        activo: true,
      },
    });
    if (productoExistente && productoExistente.idproducto !== productoId) {
      throw new Error('Ya existe un producto con ese nombre');
    }
  }

  // Actualizar el producto
  await productoActual.update(item);
  return productoActual;
}

public async delete(item: { id: string }): Promise<Producto | undefined> {
  const productoToDelete = await this.findOne(item);
  if (!productoToDelete) return undefined;

  // Verificar si tiene pedidos asociados usando Sequelize
  const pedidosAsociados = await ProductosPedido.count({
    where: { id_producto: productoToDelete.idproducto }
  });

  if (pedidosAsociados > 0) {
    // Solo marcar como inactivo
    await productoToDelete.update({ activo: false });
    return productoToDelete;
  } else {
    // Eliminar completamente
    await productoToDelete.destroy();
    return productoToDelete;
  }
}

// método para reactivar:
public async reactivate(item: { id: string }): Promise<Producto | undefined> {
  const productoId = Number.parseInt(item.id);
  const producto = await Producto.findByPk(productoId);
  if (!producto) return undefined;

  await producto.update({ activo: true });
  return producto;
}

public async findByTipoProducto(idTipoProducto: number): Promise<any[] | undefined> {
  const productos = await Producto.findAll({
    where: {
      id_tipoprod: idTipoProducto,
      activo: true
    },
    include: [{
      model: TipoProducto,
      as: 'TipoProducto',
      attributes: ['nombre_tipo']
    }],
    order: [['nombre_prod', 'ASC']]
  });

  // Devuelve los productos con el nombre del tipo incluido
  return productos.map(p => ({
    ...p.toJSON(),
    nombre_tipo: p.TipoProducto?.nombre_tipo
  }));
}

}