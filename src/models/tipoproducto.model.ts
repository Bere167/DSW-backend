import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../shared/db/sequelize.js';

export interface TipoProductoAttributes {
  idtipo_producto: number;
  nombre_tipo: string;
  desc_tipo?: string | null;
}

// Para creación (id es opcional)
export interface TipoProductoCreationAttributes extends Optional<TipoProductoAttributes, 'idtipo_producto'> {}

export class TipoProducto extends Model<TipoProductoAttributes, TipoProductoCreationAttributes>
  implements TipoProductoAttributes {
  public idtipo_producto!: number;
  public nombre_tipo!: string;
  public desc_tipo!: string | null;
}

TipoProducto.init(
  {
    idtipo_producto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_tipo: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    desc_tipo: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'TipoProducto',
    tableName: 'tipo_producto',
    timestamps: false,
  }
);
