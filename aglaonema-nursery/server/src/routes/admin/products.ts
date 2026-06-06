import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth';

const router = Router();

router.get('/', async (req, res: Response) => {
  const { category, status, page = '1' } = req.query;
  const where: any = {};
  if (category) where.category = category;
  if (status === 'active') where.isActive = true;
  if (status === 'inactive') where.isActive = false;
  if (status === 'low') where.stock = { lte: 10, gt: 0 };
  if (status === 'out') where.stock = 0;
  
  const skip = (Number(page) - 1) * 20;
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: 20 }),
    prisma.product.count({ where }),
  ]);
  res.json({ products, total, totalPages: Math.ceil(total / 20) });
});

router.post('/', async (req, res: Response) => {
  try {
    const { name, description, price, stock, category, images } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const product = await prisma.product.create({ data: { name, slug, description, price: Number(price), stock: Number(stock), category, images: images || [] } });
    res.json({ product });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res: Response) => {
  try {
    const { name, description, price, stock, category, images, isActive } = req.body;
    const data: any = { description, price: Number(price), stock: Number(stock), category, images, isActive };
    if (name) { data.name = name; data.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }
    const product = await prisma.product.update({ where: { id: req.params.id }, data });
    res.json({ product });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res: Response) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ message: 'Produk dinonaktifkan' });
});

export default router;
