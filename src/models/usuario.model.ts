import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../shared/db/sequelize.js';

export interface UsuarioAttributes {
  id_usuario: number;
  user_usuario: string;
  contraseña: string;
  email_usuario: string;
  tel_usuario: number;
  direccion_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
  tipo_usuario: number;
}

export interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'id_usuario'> {}

export class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes>
  implements UsuarioAttributes {
  public id_usuario!: number;
  public user_usuario!: string;
  public contraseña!: string;
  public email_usuario!: string;
  public tel_usuario!: number;
  public direccion_usuario!: string;
  public nombre_usuario!: string;
  public apellido_usuario!: string;
  public tipo_usuario!: number;
}

Usuario.init(
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_usuario: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    contraseña: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email_usuario: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    tel_usuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    direccion_usuario: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nombre_usuario: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido_usuario: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2, // 2 = cliente, 1 = admin
    },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuario',
    timestamps: false,
  }
);