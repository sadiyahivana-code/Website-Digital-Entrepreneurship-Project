import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireUserLogin, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireUserLogin);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } },
    });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user!.id }, include: { items: { include: { product: true } } } });
    }
    res.json({ cart });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/add', async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;
    let cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user!.id } });
    
    const existing = await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId } } });
    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
    } else {
      await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
    }
    
    const updatedCart = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: { include: { product: true } } } });
    res.json({ cart: updatedCart });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/item/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    } else {
      await prisma.cartItem.update({ where: { id: req.params.itemId }, data: { quantity } });
    }
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id }, include: { items: { include: { product: true } } } });
    res.json({ cart });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/item/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id }, include: { items: { include: { product: true } } } });
    res.json({ cart });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/clear', async (req: AuthRequest, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ message: 'Cart cleared' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/merge', async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]
    let cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user!.id } });
    
    for (const item of items) {
      const existing = await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: item.productId } } });
      if (existing) {
        await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + item.quantity } });
      } else {
        await prisma.cartItem.create({ data: { cartId: cart.id, productId: item.productId, quantity: item.quantity } });
      }
    }
    
    const updatedCart = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: { include: { product: true } } } });
    res.json({ cart: updatedCart });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
