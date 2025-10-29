import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../shared/db/sequelize.js';
import { Usuario } from './usuario.model.js';
import { ProductosPedido } from './prod_ped.model.js';

export interface PedidoAttributes {
  id_pedido: number;
  fecha_pedido: Date;
  estado_pedido: string;
  total_pedido: number;
  id_usuario: number;
}

export interface PedidoCreationAttributes extends Optional<PedidoAttributes, 'id_pedido'> {}

export class Pedido extends Model<PedidoAttributes, PedidoCreationAttributes>
  implements PedidoAttributes {
  public id_pedido!: number;
  public fecha_pedido!: Date;
  public estado_pedido!: string;
  public total_pedido!: number;
  public id_usuario!: number;

  public usuario?: Usuario;
  public productosPedido?: ProductosPedido[];
}

Pedido.init(
  {
    id_pedido: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha_pedido: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estado_pedido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total_pedido: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Pedido',
    tableName: 'pedido',
    timestamps: false,
  }
);
