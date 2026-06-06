import { Router, Response } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

router.get('/', async (req, res: Response) => {
  const { page = '1' } = req.query;
  const skip = (Number(page) - 1) * 20;
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where: { role: 'USER' }, select: { id: true, name: true, email: true, phone: true, isSuspended: true, createdAt: true, orders: { select: { totalAmount: true } } }, orderBy: { createdAt: 'desc' }, skip, take: 20 }),
    prisma.user.count({ where: { role: 'USER' } }),
  ]);
  res.json({ users, total, totalPages: Math.ceil(total / 20) });
});

router.put('/:id/suspend', async (req, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    const updated = await prisma.user.update({ where: { id: req.params.id }, data: { isSuspended: !user.isSuspended } });
    res.json({ message: updated.isSuspended ? 'Akun dinonaktifkan' : 'Akun diaktifkan kembali', isSuspended: updated.isSuspended });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
