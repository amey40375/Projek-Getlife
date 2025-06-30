import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertUserProfileSchema, insertOrderSchema, insertTopUpRequestSchema, insertBalanceTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Profile management routes
  app.get("/api/profile/:id", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const validatedData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile({ 
        ...validatedData, 
        id: req.body.id 
      });
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: "Invalid profile data" });
    }
  });

  app.put("/api/profile/:id", async (req, res) => {
    try {
      const profile = await storage.updateProfile(req.params.id, req.body);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.json(order);
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(400).json({ error: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // Accept order (for mitra)
  app.post("/api/orders/:id/accept", async (req, res) => {
    try {
      const { mitraId } = req.body;
      const order = await storage.acceptOrder(req.params.id, mitraId);
      if (!order) {
        return res.status(404).json({ error: "Order not found or insufficient balance" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to accept order" });
    }
  });

  // Start work
  app.post("/api/orders/:id/start", async (req, res) => {
    try {
      const order = await storage.startWork(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to start work" });
    }
  });

  // Complete work
  app.post("/api/orders/:id/complete", async (req, res) => {
    try {
      const order = await storage.completeWork(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete work" });
    }
  });

  // Rate and review
  app.post("/api/orders/:id/rate", async (req, res) => {
    try {
      const { rating, review } = req.body;
      const order = await storage.rateOrder(req.params.id, rating, review);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to rate order" });
    }
  });

  // Balance routes
  app.get("/api/balance/:userId", async (req, res) => {
    try {
      const balance = await storage.getBalance(req.params.userId);
      res.json({ balance });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balance" });
    }
  });

  app.get("/api/balance-transactions/:userId", async (req, res) => {
    try {
      const transactions = await storage.getBalanceTransactions(req.params.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Top-up routes
  app.post("/api/topup", async (req, res) => {
    try {
      const validatedData = insertTopUpRequestSchema.parse(req.body);
      const topup = await storage.createTopUpRequest(validatedData);
      res.json(topup);
    } catch (error) {
      res.status(400).json({ error: "Failed to create top-up request" });
    }
  });

  app.get("/api/topup-requests", async (req, res) => {
    try {
      const requests = await storage.getTopUpRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top-up requests" });
    }
  });

  app.post("/api/topup-requests/:id/approve", async (req, res) => {
    try {
      const { adminId } = req.body;
      const result = await storage.approveTopUp(req.params.id, adminId);
      if (!result) {
        return res.status(404).json({ error: "Top-up request not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve top-up" });
    }
  });

  app.post("/api/topup-requests/:id/reject", async (req, res) => {
    try {
      const { adminId } = req.body;
      const result = await storage.rejectTopUp(req.params.id, adminId);
      if (!result) {
        return res.status(404).json({ error: "Top-up request not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject top-up" });
    }
  });

  // Mitra verification routes
  app.get("/api/mitra-verifications", async (req, res) => {
    try {
      const verifications = await storage.getMitraVerifications();
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch verifications" });
    }
  });

  app.post("/api/mitra-verifications/:id/approve", async (req, res) => {
    try {
      const { adminId } = req.body;
      const result = await storage.approveMitra(req.params.id, adminId);
      if (!result) {
        return res.status(404).json({ error: "Verification not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve mitra" });
    }
  });

  app.post("/api/mitra-verifications/:id/reject", async (req, res) => {
    try {
      const { adminId } = req.body;
      const result = await storage.rejectMitra(req.params.id, adminId);
      if (!result) {
        return res.status(404).json({ error: "Verification not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject mitra" });
    }
  });

  // Chat routes
  app.get("/api/chat/:orderId", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.orderId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const message = await storage.sendMessage(req.body);
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Voucher routes
  app.get("/api/vouchers", async (req, res) => {
    try {
      const vouchers = await storage.getVouchers();
      res.json(vouchers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vouchers" });
    }
  });

  app.post("/api/vouchers/:id/use", async (req, res) => {
    try {
      const { userId } = req.body;
      const result = await storage.useVoucher(req.params.id, userId);
      if (!result) {
        return res.status(400).json({ error: "Voucher not available or already used" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to use voucher" });
    }
  });

  // Banner routes
  app.get("/api/banners", async (req, res) => {
    try {
      const banners = await storage.getBanners();
      res.json(banners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });

  app.post("/api/banners", async (req, res) => {
    try {
      const banner = await storage.createBanner(req.body);
      res.json(banner);
    } catch (error) {
      res.status(500).json({ error: "Failed to create banner" });
    }
  });

  app.put("/api/banners/:id", async (req, res) => {
    try {
      const banner = await storage.updateBanner(req.params.id, req.body);
      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }
      res.json(banner);
    } catch (error) {
      res.status(500).json({ error: "Failed to update banner" });
    }
  });

  // Admin statistics
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Manual balance transfer
  app.post("/api/admin/transfer-balance", async (req, res) => {
    try {
      const { fromUserId, toUserId, amount, description, adminId } = req.body;
      const result = await storage.transferBalance(fromUserId, toUserId, amount, description, adminId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to transfer balance" });
    }
  });

  // Toggle mitra status
  app.post("/api/mitra/:id/toggle-status", async (req, res) => {
    try {
      const result = await storage.toggleMitraStatus(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Mitra not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}