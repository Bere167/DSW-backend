import { Producto } from './producto.model.js';
import { Usuario } from './usuario.model.js';
import { TipoProducto } from './tipoproducto.model.js';
import { Pedido } from './pedido.model.js';
import { ProductosPedido } from './prod_ped.model.js';

// Producto <-> TipoProducto
Producto.belongsTo(TipoProducto, { foreignKey: 'id_tipoprod', as: 'TipoProducto' });
TipoProducto.hasMany(Producto, { foreignKey: 'id_tipoprod' });

// ProductosPedido <-> Pedido
ProductosPedido.belongsTo(Pedido, { foreignKey: 'id_pedido', as: 'pedido' });
Pedido.hasMany(ProductosPedido, { foreignKey: 'id_pedido', as: 'productosPedido' });

// ProductosPedido <-> Producto
ProductosPedido.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });
Producto.hasMany(ProductosPedido, { foreignKey: 'id_producto', as: 'productosPedido' });

Usuario.hasMany(Pedido, { foreignKey: 'id_usuario', as: 'pedidos' });
Pedido.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

