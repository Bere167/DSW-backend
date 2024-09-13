import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.DB_HOST  ||'%',
  user: process.env.DB_USER || 'tpdsw',
  password: process.env.DB_PASSWORD || 'dsw304',
  database: process.env.DB_DATABASE || 'tiendainformatica',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle : 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})