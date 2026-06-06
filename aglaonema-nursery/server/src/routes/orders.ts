import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireUserLogin, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireUserLogin);

function generateInvoice(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${dateStr}-${rand}`;
}

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, shippingMethod, paymentMethod, notes } = req.body;
    
    let totalAmount = 0;
    const shippingCosts: Record<string, number> = { 'JNE Regular': 15000, 'JNE Express': 25000, 'SiCepat': 18000 };
    const shippingCost = shippingCosts[shippingMethod] || 15000;
    
    const orderItems = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) throw new Error(`Produk ${item.productId} tidak tersedia`);
      if (product.stock < item.quantity) throw new Error(`Stok ${product.name} tidak mencukupi`);
      totalAmount += product.price * item.quantity;
      orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price });
    }
    
    const invoiceNumber = generateInvoice();
    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        invoiceNumber,
        totalAmount: totalAmount + shippingCost,
        shippingCost,
        paymentMethod,
        shippingAddress,
        shippingMethod,
        notes,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });
    
    // Reduce stock
    for (const item of orderItems) {
      await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity }, sold: { increment: item.quantity } } });
    }
    
    // Clear cart
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    
    res.json({ order });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Server error' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, from, to, invoice, page = '1' } = req.query;
    const where: any = { userId: req.user!.id };
    if (status) where.status = status;
    if (invoice) where.invoiceNumber = { contains: invoice as string };
    if (from || to) where.createdAt = { gte: from ? new Date(from as string) : undefined, lte: to ? new Date(to as string) : undefined };
    
    const skip = (Number(page) - 1) * 10;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' }, skip, take: 10 }),
      prisma.order.count({ where }),
    ]);
    res.json({ orders, total, totalPages: Math.ceil(total / 10) });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { items: { include: { product: true } }, user: { select: { name: true, email: true, phone: true } } },
    });
    if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    res.json({ order });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/payment-proof', async (req: AuthRequest, res: Response) => {
  try {
    const { paymentProof } = req.body; // base64 or URL
    const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    
    await prisma.order.update({ where: { id: order.id }, data: { paymentProof, paymentStatus: 'WAITING' } });
    res.json({ message: 'Bukti pembayaran berhasil dikirim' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
