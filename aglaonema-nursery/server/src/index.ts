import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

import authRoutes from "./routes/auth";
import adminAuthRoutes from "./routes/adminAuth";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";
import storeRoutes from "./routes/stores";
import adminProductRoutes from "./routes/admin/products";
import adminOrderRoutes from "./routes/admin/orders";
import adminUserRoutes from "./routes/admin/users";
import adminReportRoutes from "./routes/admin/reports";
import paymentRoutes from "./routes/payment";
import { requireAdmin } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stores", storeRoutes);

// Protected user routes
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// Admin routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/products", requireAdmin, adminProductRoutes);
app.use("/api/admin/orders", requireAdmin, adminOrderRoutes);
app.use("/api/admin/users", requireAdmin, adminUserRoutes);
app.use("/api/admin/reports", requireAdmin, adminReportRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`🌿 Aglaonema Nursery Server running on port ${PORT}`);
});

export default app;
