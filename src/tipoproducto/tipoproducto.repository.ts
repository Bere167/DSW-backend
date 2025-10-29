import { Repository } from "../shared/repository.js";
import { TipoProducto } from '../models/tipoproducto.model.js';
import { Producto } from '../models/producto.model.js';


export class TipoProductoRepository implements Repository<TipoProducto>{
  public async findAll(): Promise<TipoProducto[] | undefined> {
  return await TipoProducto.findAll({
    order: [['nombre_tipo', 'ASC']]
  });
}

  public async findOne(item: { id: string }): Promise<TipoProducto | undefined> {
  const id = Number.parseInt(item.id);
  const tipoProducto = await TipoProducto.findByPk(id);
  return tipoProducto || undefined;
}


public async findByName(nombre: string): Promise<TipoProducto | undefined> {
  const tipoProducto = await TipoProducto.findOne({
    where: { nombre_tipo: nombre.trim() }
  });
  return tipoProducto || undefined;
}

  public async add(item: { nombre_tipo: string; desc_tipo?: string }): Promise<TipoProducto> {
  const nuevo = await TipoProducto.create({
    nombre_tipo: item.nombre_tipo,
    desc_tipo: item.desc_tipo
  });
  return nuevo;
}

public async update(id: string, item: Partial<TipoProducto>): Promise<TipoProducto | undefined> {
  const tipoProductoId = Number.parseInt(id);
  const tipoProducto = await TipoProducto.findByPk(tipoProductoId);
  if (!tipoProducto) return undefined;

  await tipoProducto.update(item);
  return tipoProducto;
}


public async delete(item: { id: string }): Promise<TipoProducto> {
  const tipoProductoId = Number.parseInt(item.id);
  const tipoProducto = await TipoProducto.findByPk(tipoProductoId);
  if (!tipoProducto) throw new Error('Tipo de producto no encontrado');

  const productosAsociados = await Producto.count({
    where: { id_tipoprod: tipoProductoId }
  });

  if (productosAsociados > 0) {
    throw new Error('No se puede eliminar: hay productos asociados a este tipo.');
  }

  await tipoProducto.destroy();
  return tipoProducto;
}
}


