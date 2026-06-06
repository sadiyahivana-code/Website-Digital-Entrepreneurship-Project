import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'ADMIN') return res.status(401).json({ message: 'Email atau password salah' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Email atau password salah' });
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_ADMIN_SECRET!, { expiresIn: '8h' });
    res.cookie('adminToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 28800000 });
    
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', (_, res: Response) => {
  res.clearCookie('adminToken');
  res.json({ message: 'Logout berhasil' });
});

router.get('/me', requireAdmin, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, email: true, role: true, avatar: true } });
  res.json({ user });
});

export default router;
