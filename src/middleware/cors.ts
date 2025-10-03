import cors from 'cors';

export const corsOptions = {
  origin: [
    'http://localhost:3000',    // React (Create React App)
    'http://localhost:5173',    // Vite (puerto por defecto)
    'http://127.0.0.1:5173',    // Vite alternativo
    'http://localhost:5174',    // Vite (puerto alternativo)
    'http://127.0.0.1:5174'     // Vite alternativo
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', //Para enviar JSON
    'Authorization', //Para enviar tokens JWT
    'X-Requested-With',
    'Accept'
  ],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200  // Para navegadores legacy
};

export const corsMiddleware = cors(corsOptions);

