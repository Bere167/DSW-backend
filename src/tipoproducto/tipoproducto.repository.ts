import { Repository } from "../shared/repository.js";
import { TipoProducto } from "./tipoproducto.entity.js";

const tipoproducto = [
  new TipoProducto(
    'Procesador',
    'El procesador es la pieza central del rendimiento de los programas.',
    'a02b91bc-3769-4221-beb1-d7a3aeba7dad'
  ),
]

export class TipoProductoRepository implements Repository<TipoProducto>{

   public findAll(): TipoProducto[] | undefined {
    return tipoproducto
  }

  public findOne(item: { id: string }): TipoProducto | undefined {
    return tipoproducto.find((tipoproducto) => tipoproducto.id === item.id)

  }

  public add(item: TipoProducto): TipoProducto | undefined {
    tipoproducto.push(item)
    return item
  }

  public update(item: TipoProducto): TipoProducto | undefined {
    const tipoproductoIdx = tipoproducto.findIndex((tipoproducto) => tipoproducto.id === item.id)

    if (tipoproductoIdx !== -1) {
      tipoproducto[tipoproductoIdx] = { ...tipoproducto[tipoproductoIdx], ...item }
    }
    return tipoproducto[tipoproductoIdx]
  }

  public delete(item: { id: string }): TipoProducto | undefined {
    const tipoproductoIdx = tipoproducto.findIndex((tipoproducto) => tipoproducto.id === item.id)

    if (tipoproductoIdx !== -1) {
      const deletedTiposproducto = tipoproducto[tipoproductoIdx]
      tipoproducto.splice(tipoproductoIdx, 1)
      return deletedTiposproducto
    }
  } 
}