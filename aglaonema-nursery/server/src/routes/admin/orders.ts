import { Router, Response } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

router.get('/', async (req, res: Response) => {
  const { status, from, to, payment, page = '1' } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (payment) where.paymentMethod = { contains: payment as string };
  if (from || to) where.createdAt = { gte: from ? new Date(from as string) : undefined, lte: to ? new Date(to as string) : undefined };
  
  const skip = (Number(page) - 1) * 20;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, include: { user: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true } } } } }, orderBy: { createdAt: 'desc' }, skip, take: 20 }),
    prisma.order.count({ where }),
  ]);
  res.json({ orders, total, totalPages: Math.ceil(total / 20) });
});

router.get('/:id', async (req, res: Response) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { user: true, items: { include: { product: true } } } });
  if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
  res.json({ order });
});

router.put('/:id/status', async (req, res: Response) => {
  try {
    const { status, trackingNumber } = req.body;
    const data: any = { status };
    if (trackingNumber) data.trackingNumber = trackingNumber;
    const order = await prisma.order.update({ where: { id: req.params.id }, data });
    res.json({ order });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/payment', async (req, res: Response) => {
  try {
    const { action } = req.body; // 'confirm' or 'reject'
    const paymentStatus = action === 'confirm' ? 'CONFIRMED' : 'REJECTED';
    const status = action === 'confirm' ? 'PROCESSING' : 'PENDING';
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { paymentStatus, status } });
    res.json({ order });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
