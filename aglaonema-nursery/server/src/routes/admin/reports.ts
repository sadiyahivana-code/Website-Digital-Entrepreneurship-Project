import { Router, Response } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

router.get('/', async (req, res: Response) => {
  try {
    const { from, to, status, category, payment } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (payment) where.paymentMethod = { contains: payment as string };
    if (from || to) where.createdAt = {
      gte: from ? new Date(from as string) : new Date(new Date().setDate(new Date().getDate() - 30)),
      lte: to ? new Date(to as string) : new Date(),
    };
    
    const orders = await prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true, category: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    
    // Aggregate data
    const totalRevenue = orders.filter(o => o.paymentStatus === 'CONFIRMED').reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Daily revenue
    const dailyMap: Record<string, number> = {};
    orders.forEach(o => {
      if (o.paymentStatus === 'CONFIRMED') {
        const day = o.createdAt.toISOString().slice(0, 10);
        dailyMap[day] = (dailyMap[day] || 0) + o.totalAmount;
      }
    });
    const dailyRevenue = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date));
    
    // Product sales
    const productMap: Record<string, { name: string; sold: number; revenue: number }> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const key = item.productId;
        if (!productMap[key]) productMap[key] = { name: item.product.name, sold: 0, revenue: 0 };
        productMap[key].sold += item.quantity;
        productMap[key].revenue += item.price * item.quantity;
      });
    });
    const productSales = Object.entries(productMap).map(([id, data]) => ({ id, ...data })).sort((a, b) => b.sold - a.sold);
    
    // Items sold
    const totalItemsSold = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
    
    res.json({ summary: { totalRevenue, totalOrders, avgOrderValue, totalItemsSold }, dailyRevenue, productSales, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard stats
router.get('/dashboard', async (_, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [monthRevenue, totalOrders, activeProducts, newCustomers, recentOrders, last30Days] = await Promise.all([
      prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth }, paymentStatus: 'CONFIRMED' }, _sum: { totalAmount: true } }),
      prisma.order.groupBy({ by: ['status'], _count: true }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'USER', createdAt: { gte: startOfMonth } } }),
      prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } }),
      prisma.order.findMany({ where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) }, paymentStatus: 'CONFIRMED' }, select: { createdAt: true, totalAmount: true } }),
    ]);
    
    const dailyMap: Record<string, number> = {};
    last30Days.forEach(o => {
      const day = o.createdAt.toISOString().slice(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + o.totalAmount;
    });
    
    res.json({
      monthRevenue: monthRevenue._sum.totalAmount || 0,
      ordersByStatus: totalOrders,
      activeProducts,
      newCustomers,
      recentOrders,
      chartData: Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
