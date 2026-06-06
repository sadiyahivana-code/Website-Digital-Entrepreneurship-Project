import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { requireUserLogin, verifyUserToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Semua field wajib diisi' });
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email sudah terdaftar' });
    
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, password: hashed, phone, role: 'USER' } });
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_USER_SECRET!, { expiresIn: '1d' });
    res.cookie('userToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 86400000 });
    
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res: Response) => {
  try {
    const { email, password, remember } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Email tidak terdaftar' });
    if (user.isSuspended) return res.status(403).json({ message: 'Akun Anda telah dinonaktifkan' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Password salah' });
    
    const expiresIn = remember ? '30d' : '1d';
    const maxAge = remember ? 30 * 86400000 : 86400000;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_USER_SECRET!, { expiresIn });
    res.cookie('userToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge });
    
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar } });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', (_, res: Response) => {
  res.clearCookie('userToken');
  res.json({ message: 'Logout berhasil' });
});

router.get('/me', verifyUserToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Tidak terautentikasi' });
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, name: true, email: true, role: true, phone: true, address: true, avatar: true } });
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
  res.json({ user });
});

router.put('/profile', requireUserLogin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address } = req.body;
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: { name, phone, address }, select: { id: true, name: true, email: true, phone: true, address: true, avatar: true } });
    res.json({ user });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/password', requireUserLogin, async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Password lama salah' });
    
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    res.json({ message: 'Password berhasil diubah' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
