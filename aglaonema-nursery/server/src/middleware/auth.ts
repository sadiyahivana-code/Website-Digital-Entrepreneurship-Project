import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}

export const verifyUserToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.userToken || req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_USER_SECRET!) as any;
    req.user = decoded;
  } catch {}
  next();
};

export const requireUserLogin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.userToken || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Login diperlukan' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_USER_SECRET!) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.adminToken || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Admin login diperlukan' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET!) as any;
    if (decoded.role !== 'ADMIN') return res.status(403).json({ message: 'Akses ditolak' });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Token admin tidak valid' });
  }
};
