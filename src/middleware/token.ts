import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { config } from 'dotenv';
import { Request, Response, NextFunction } from 'express';


config();

const secret = process.env.SECRET as string;

const ROLES = {
  ADMIN: 1,
} as const;

interface UserPayload {
  id: number;
  user_usuario: string;
  tipo_usuario: number;
  [key: string]: any;
}

interface AuthenticatedRequest extends Request {
  user?: UserPayload | string | JwtPayload;
}

export const generateToken = (user: UserPayload): string => {
  const options: SignOptions = { expiresIn: '1h' };
  return jwt.sign(user, secret, options);
};

export const validateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: 'Su sesión expiró, ingrese nuevamente' });
      return;
    }
    req.user = decoded;
    next();
  });
};

export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const user = req.user as UserPayload;
  if (user?.tipo_usuario === ROLES.ADMIN) {
    next();
  } else {
    res.status(403).json({ message: 'No tiene permisos para realizar esta acción' });
  }
};