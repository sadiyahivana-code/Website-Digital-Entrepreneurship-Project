import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyUserToken, requireUserLogin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res: Response) => {
  try {
    const { category, minPrice, maxPrice, rating, inStock, sort, search, page = '1', limit = '12' } = req.query;
    
    const where: any = { isActive: true };
    if (category) where.category = category;
    if (minPrice || maxPrice) where.price = { gte: minPrice ? Number(minPrice) : undefined, lte: maxPrice ? Number(maxPrice) : undefined };
    if (rating) where.rating = { gte: Number(rating) };
    if (inStock === 'true') where.stock = { gt: 0 };
    if (search) where.name = { contains: search as string, mode: 'insensitive' };
    
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'best_seller') orderBy = { sold: 'desc' };
    else if (sort === 'best_rating') orderBy = { rating: 'desc' };
    
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take: Number(limit) }),
      prisma.product.count({ where }),
    ]);
    
    res.json({ products, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/categories', async (_, res: Response) => {
  const products = await prisma.product.findMany({ where: { isActive: true }, select: { category: true }, distinct: ['category'] });
  res.json({ categories: products.map(p => p.category) });
});

router.get('/:slug', async (req, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { reviews: { include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: 'desc' } } },
    });
    if (!product || !product.isActive) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json({ product });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/related', async (req, res: Response) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    const related = await prisma.product.findMany({ where: { category: product.category, id: { not: product.id }, isActive: true }, take: 4 });
    res.json({ products: related });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:productId/reviews', requireUserLogin, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    
    // Check if user bought this product
    const bought = await prisma.orderItem.findFirst({
      where: { productId, order: { userId: req.user!.id, status: { in: ['DELIVERED', 'PAID'] } } },
    });
    if (!bought) return res.status(403).json({ message: 'Anda harus membeli produk ini terlebih dahulu' });
    
    const review = await prisma.productReview.create({
      data: { userId: req.user!.id, productId, rating: Number(rating), comment },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    
    // Update product rating
    const reviews = await prisma.productReview.findMany({ where: { productId } });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await prisma.product.update({ where: { id: productId }, data: { rating: Math.round(avgRating * 10) / 10 } });
    
    res.json({ review });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
