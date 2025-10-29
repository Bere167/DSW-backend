import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../shared/db/sequelize.js';
import { Producto } from './producto.model.js';
import { Pedido } from './pedido.model.js';

export interface ProductosPedidoAttributes {
  id: number;
  cantidad: number;
  precio_unitario: number;
  precio_parcial: number;
  id_producto: number;
  id_pedido: number;
}

export interface ProductosPedidoCreationAttributes extends Optional<ProductosPedidoAttributes, 'id'> {}

export class ProductosPedido extends Model<ProductosPedidoAttributes, ProductosPedidoCreationAttributes>
  implements ProductosPedidoAttributes {
  public id!: number;
  public cantidad!: number;
  public precio_unitario!: number;
  public precio_parcial!: number;
  public id_producto!: number;
  public id_pedido!: number;

  public producto?: Producto;
  public pedido?: Pedido;
}

ProductosPedido.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    precio_parcial: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_pedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ProductosPedido',
    tableName: 'productos_pedido', // 👈 nombre real de la tabla
    timestamps: false,
  }
);

