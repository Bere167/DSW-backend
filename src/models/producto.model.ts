import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../shared/db/sequelize.js';
import { TipoProducto } from './tipoproducto.model.js';

export interface ProductoAttributes {
  idproducto: number;
  nombre_prod: string;
  precio: number;
  desc_prod?: string | null;
  cant_stock?: number | null;
  imagen?: string | null;
  id_tipoprod: number;
  activo: boolean;
}

// Para creación (idproducto es opcional)
export interface ProductoCreationAttributes extends Optional<ProductoAttributes, 'idproducto'> {}

export class Producto extends Model<ProductoAttributes, ProductoCreationAttributes>
  implements ProductoAttributes {
  public idproducto!: number;
  public nombre_prod!: string;
  public precio!: number;
  public desc_prod!: string | null;
  public cant_stock!: number | null;
  public imagen!: string | null;
  public id_tipoprod!: number;
  public activo!: boolean;

  public TipoProducto?: TipoProducto;
}

Producto.init(
  {
    idproducto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_prod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    desc_prod: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    cant_stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    imagen: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_tipoprod: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Producto',
    tableName: 'producto',
    timestamps: false,
  }
);


