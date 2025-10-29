import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'tiendainformatica',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || 'dsw2025',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Cambia a true si quieres ver los logs de SQL
  }
);

// Prueba la conexión (puedes borrar esto luego)
sequelize.authenticate()
  .then(() => console.log('✅ Conexión a MySQL con Sequelize exitosa'))
  .catch(err => console.error('❌ Error de conexión Sequelize:', err));