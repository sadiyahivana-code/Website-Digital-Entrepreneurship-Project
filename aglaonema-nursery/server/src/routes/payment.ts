import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { requireUserLogin, AuthRequest } from "../middleware/auth";
// @ts-ignore
import midtransClient from "midtrans-client";

const router = Router();
router.use(requireUserLogin);

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

router.post("/create-token", async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id },
      include: { items: { include: { product: true } }, user: true },
    });
    if (!order)
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });

    const parameter = {
      transaction_details: {
        order_id: order.invoiceNumber,
        gross_amount: order.totalAmount,
      },
      customer_details: {
        first_name: order.user.name,
        email: order.user.email,
        phone: order.user.phone || "",
      },
      item_details: [
        ...order.items.map((item: any) => ({
          id: item.productId,
          price: item.price,
          quantity: item.quantity,
          name: item.product.name,
        })),
        {
          id: "SHIPPING",
          price: order.shippingCost,
          quantity: 1,
          name: "Ongkos Kirim",
        },
      ],
    };

    const token = await snap.createTransactionToken(parameter);
    res.json({ token, clientKey: process.env.MIDTRANS_CLIENT_KEY });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.post("/notification", async (req, res) => {
  try {
    const notification = await snap.transaction.notification(req.body);
    const { order_id, transaction_status, fraud_status } = notification;

    const order = await prisma.order.findFirst({
      where: { invoiceNumber: order_id },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    let paymentStatus: any = "PENDING";
    if (transaction_status === "capture" && fraud_status === "accept")
      paymentStatus = "PAID";
    else if (transaction_status === "settlement") paymentStatus = "PAID";
    else if (["cancel", "deny", "expire"].includes(transaction_status))
      paymentStatus = "FAILED";

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus,
        status: paymentStatus === "PAID" ? "PROCESSING" : order.status,
      },
    });

    res.json({ message: "OK" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
