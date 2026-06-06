import { Router, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (_, res: Response) => {
  try {
    const stores = await prisma.storeLocation.findMany();
    res.json({ stores });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
