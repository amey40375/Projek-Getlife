import { 
  profiles, userProfiles, mitraProfiles, mitraVerifications, services, orders, 
  vouchers, voucherUsage, banners, chatMessages, balanceTransactions, topUpRequests,
  type Profile, type UserProfile, type MitraProfile, type Service, type Order, 
  type Voucher, type VoucherUsage, type Banner, type ChatMessage, type BalanceTransaction, type TopUpRequest,
  type InsertProfile, type InsertUserProfile, type InsertMitraProfile, type InsertService, 
  type InsertOrder, type InsertVoucher, type InsertBanner, type InsertChatMessage, 
  type InsertBalanceTransaction, type InsertTopUpRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, sum } from "drizzle-orm";

export interface IStorage {
  // Profile management
  getProfile(id: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile & { id: string }): Promise<Profile>;
  updateProfile(id: string, profile: Partial<Profile>): Promise<Profile | undefined>;
  
  // User profile management
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(userProfile: InsertUserProfile & { user_id: string }): Promise<UserProfile>;
  updateUserProfile(userId: string, userProfile: Partial<UserProfile>): Promise<UserProfile | undefined>;
  
  // Service management
  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  
  // Order management
  getOrders(userId?: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<Order>): Promise<Order | undefined>;
  acceptOrder(orderId: string, mitraId: string): Promise<Order | undefined>;
  startWork(orderId: string): Promise<Order | undefined>;
  completeWork(orderId: string): Promise<Order | undefined>;
  rateOrder(orderId: string, rating: number, review: string): Promise<Order | undefined>;
  
  // Voucher management
  getVouchers(): Promise<Voucher[]>;
  useVoucher(voucherId: string, userId: string): Promise<VoucherUsage | undefined>;
  
  // Banner management
  getBanners(): Promise<Banner[]>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: string, banner: Partial<Banner>): Promise<Banner | undefined>;
  
  // Balance management
  getBalance(userId: string): Promise<number>;
  getBalanceTransactions(userId: string): Promise<BalanceTransaction[]>;
  
  // Top-up management
  createTopUpRequest(request: InsertTopUpRequest): Promise<TopUpRequest>;
  getTopUpRequests(): Promise<TopUpRequest[]>;
  approveTopUp(requestId: string, adminId: string): Promise<TopUpRequest | undefined>;
  rejectTopUp(requestId: string, adminId: string): Promise<TopUpRequest | undefined>;
  
  // Mitra verification
  getMitraVerifications(): Promise<any[]>;
  approveMitra(verificationId: string, adminId: string): Promise<any>;
  rejectMitra(verificationId: string, adminId: string): Promise<any>;
  
  // Chat functionality
  getChatMessages(orderId: string): Promise<ChatMessage[]>;
  sendMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Admin functions
  getAdminStats(): Promise<any>;
  transferBalance(fromUserId: string, toUserId: string, amount: number, description: string, adminId: string): Promise<any>;
  toggleMitraStatus(mitraId: string): Promise<any>;
  
  // Legacy compatibility
  getUser(id: string): Promise<Profile | undefined>;
  getUserByUsername(username: string): Promise<Profile | undefined>;
  createUser(user: InsertProfile & { id: string }): Promise<Profile>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async createProfile(profile: InsertProfile & { id: string }): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(id: string, profile: Partial<Profile>): Promise<Profile | undefined> {
    const [updated] = await db.update(profiles).set(profile).where(eq(profiles.id, id)).returning();
    return updated;
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [userProfile] = await db.select().from(userProfiles).where(eq(userProfiles.user_id, userId));
    return userProfile;
  }

  async createUserProfile(userProfile: InsertUserProfile & { user_id: string }): Promise<UserProfile> {
    const [newUserProfile] = await db.insert(userProfiles).values(userProfile).returning();
    return newUserProfile;
  }

  async updateUserProfile(userId: string, userProfile: Partial<UserProfile>): Promise<UserProfile | undefined> {
    const [updated] = await db.update(userProfiles).set(userProfile).where(eq(userProfiles.user_id, userId)).returning();
    return updated;
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.is_active, true));
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getOrders(userId?: string): Promise<Order[]> {
    if (userId) {
      return await db.select().from(orders).where(eq(orders.user_id, userId)).orderBy(desc(orders.created_at));
    }
    return await db.select().from(orders).orderBy(desc(orders.created_at));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    // Deduct balance if payment method is balance
    if (order.payment_method === 'balance' && order.user_id) {
      await db.insert(balanceTransactions).values({
        user_id: order.user_id,
        type: 'payment',
        amount: `-${order.total_price}`,
        description: `Payment for ${order.service_name}`,
        order_id: newOrder.id,
        status: 'approved'
      });
    }
    
    return newOrder;
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set(order).where(eq(orders.id, id)).returning();
    return updated;
  }

  async acceptOrder(orderId: string, mitraId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return undefined;

    // Check if mitra has sufficient balance (20% of order value)
    const mitraBalance = await this.getBalance(mitraId);
    const requiredBalance = parseFloat(order.total_price) * 0.2;
    
    if (mitraBalance < requiredBalance) {
      return undefined;
    }

    // Deduct 20% from mitra balance
    await db.insert(balanceTransactions).values({
      user_id: mitraId,
      type: 'payment',
      amount: `-${requiredBalance}`,
      description: `Deposit for order ${orderId}`,
      order_id: orderId,
      status: 'approved'
    });

    // Update order
    const [updated] = await db.update(orders)
      .set({ mitra_id: mitraId, status: 'accepted' })
      .where(eq(orders.id, orderId))
      .returning();
    
    return updated;
  }

  async startWork(orderId: string): Promise<Order | undefined> {
    const [updated] = await db.update(orders)
      .set({ status: 'in_progress', started_at: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  }

  async completeWork(orderId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return undefined;

    // Generate invoice URL (simplified)
    const invoiceUrl = `/invoices/${orderId}.pdf`;

    const [updated] = await db.update(orders)
      .set({ 
        status: 'completed', 
        completed_at: new Date(),
        invoice_url: invoiceUrl 
      })
      .where(eq(orders.id, orderId))
      .returning();

    // Credit mitra with full payment + return deposit
    if (order.mitra_id) {
      const totalAmount = parseFloat(order.total_price) * 1.2; // 100% + 20% deposit return
      await db.insert(balanceTransactions).values({
        user_id: order.mitra_id,
        type: 'commission',
        amount: totalAmount.toString(),
        description: `Payment for completed order ${orderId}`,
        order_id: orderId,
        status: 'approved'
      });
    }

    return updated;
  }

  async rateOrder(orderId: string, rating: number, review: string): Promise<Order | undefined> {
    const [updated] = await db.update(orders)
      .set({ rating, review })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  }

  async getVouchers(): Promise<Voucher[]> {
    return await db.select().from(vouchers).where(eq(vouchers.is_active, true));
  }

  async useVoucher(voucherId: string, userId: string): Promise<VoucherUsage | undefined> {
    const [voucher] = await db.select().from(vouchers).where(eq(vouchers.id, voucherId));
    if (!voucher || !voucher.is_active) return undefined;

    // Check if user already used this voucher
    const [existing] = await db.select().from(voucherUsage)
      .where(and(eq(voucherUsage.voucher_id, voucherId), eq(voucherUsage.user_id, userId)));
    
    if (existing) return undefined;

    // Create voucher usage
    const [usage] = await db.insert(voucherUsage).values({
      voucher_id: voucherId,
      user_id: userId
    }).returning();

    // Add balance to user
    await db.insert(balanceTransactions).values({
      user_id: userId,
      type: 'voucher',
      amount: voucher.discount_amount.toString(),
      description: `Voucher: ${voucher.code}`,
      voucher_id: voucherId,
      status: 'approved'
    });

    return usage;
  }

  async getBanners(): Promise<Banner[]> {
    return await db.select().from(banners)
      .where(eq(banners.is_active, true))
      .orderBy(banners.order_index);
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const [newBanner] = await db.insert(banners).values(banner).returning();
    return newBanner;
  }

  async updateBanner(id: string, banner: Partial<Banner>): Promise<Banner | undefined> {
    const [updated] = await db.update(banners).set(banner).where(eq(banners.id, id)).returning();
    return updated;
  }

  async getBalance(userId: string): Promise<number> {
    const result = await db.select({
      total: sum(balanceTransactions.amount)
    }).from(balanceTransactions)
      .where(and(
        eq(balanceTransactions.user_id, userId),
        eq(balanceTransactions.status, 'approved')
      ));

    return parseFloat(result[0]?.total || '0');
  }

  async getBalanceTransactions(userId: string): Promise<BalanceTransaction[]> {
    return await db.select().from(balanceTransactions)
      .where(eq(balanceTransactions.user_id, userId))
      .orderBy(desc(balanceTransactions.created_at));
  }

  async createTopUpRequest(request: InsertTopUpRequest): Promise<TopUpRequest> {
    const [newRequest] = await db.insert(topUpRequests).values(request).returning();
    return newRequest;
  }

  async getTopUpRequests(): Promise<TopUpRequest[]> {
    return await db.select().from(topUpRequests)
      .orderBy(desc(topUpRequests.created_at));
  }

  async approveTopUp(requestId: string, adminId: string): Promise<TopUpRequest | undefined> {
    const [request] = await db.select().from(topUpRequests).where(eq(topUpRequests.id, requestId));
    if (!request || request.status !== 'pending') return undefined;

    // Update request status
    const [updated] = await db.update(topUpRequests)
      .set({ 
        status: 'approved', 
        approved_by: adminId, 
        approved_at: new Date() 
      })
      .where(eq(topUpRequests.id, requestId))
      .returning();

    // Add balance to user
    await db.insert(balanceTransactions).values({
      user_id: request.user_id,
      type: 'topup',
      amount: request.amount.toString(),
      description: 'Top-up approved by admin',
      status: 'approved',
      approved_by: adminId,
      approved_at: new Date()
    });

    return updated;
  }

  async rejectTopUp(requestId: string, adminId: string): Promise<TopUpRequest | undefined> {
    const [updated] = await db.update(topUpRequests)
      .set({ 
        status: 'rejected', 
        approved_by: adminId, 
        approved_at: new Date() 
      })
      .where(eq(topUpRequests.id, requestId))
      .returning();
    return updated;
  }

  async getMitraVerifications(): Promise<any[]> {
    return await db.select().from(mitraVerifications)
      .orderBy(desc(mitraVerifications.created_at));
  }

  async approveMitra(verificationId: string, adminId: string): Promise<any> {
    const [updated] = await db.update(mitraVerifications)
      .set({ 
        status: 'approved', 
        approved_by: adminId, 
        approved_at: new Date() 
      })
      .where(eq(mitraVerifications.id, verificationId))
      .returning();

    // Update profile to verified
    if (updated) {
      await db.update(profiles)
        .set({ is_verified: true })
        .where(eq(profiles.id, updated.mitra_id));
    }

    return updated;
  }

  async rejectMitra(verificationId: string, adminId: string): Promise<any> {
    const [updated] = await db.update(mitraVerifications)
      .set({ 
        status: 'rejected', 
        approved_by: adminId, 
        approved_at: new Date() 
      })
      .where(eq(mitraVerifications.id, verificationId))
      .returning();
    return updated;
  }

  async getChatMessages(orderId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.order_id, orderId))
      .orderBy(chatMessages.created_at);
  }

  async sendMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getAdminStats(): Promise<any> {
    const totalOrders = await db.select({ count: sql`count(*)` }).from(orders);
    const totalUsers = await db.select({ count: sql`count(*)` }).from(profiles).where(eq(profiles.role, 'user'));
    const totalMitras = await db.select({ count: sql`count(*)` }).from(profiles).where(eq(profiles.role, 'mitra'));
    const totalRevenue = await db.select({ total: sum(orders.total_price) }).from(orders).where(eq(orders.status, 'completed'));

    return {
      totalOrders: totalOrders[0]?.count || 0,
      totalUsers: totalUsers[0]?.count || 0,
      totalMitras: totalMitras[0]?.count || 0,
      totalRevenue: totalRevenue[0]?.total || 0
    };
  }

  async transferBalance(fromUserId: string, toUserId: string, amount: number, description: string, adminId: string): Promise<any> {
    // Deduct from sender
    await db.insert(balanceTransactions).values({
      user_id: fromUserId,
      type: 'transfer',
      amount: `-${amount}`,
      description: `Transfer to user: ${description}`,
      status: 'approved',
      approved_by: adminId,
      approved_at: new Date()
    });

    // Credit to receiver
    await db.insert(balanceTransactions).values({
      user_id: toUserId,
      type: 'transfer',
      amount: amount.toString(),
      description: `Transfer from admin: ${description}`,
      status: 'approved',
      approved_by: adminId,
      approved_at: new Date()
    });

    return { success: true };
  }

  async toggleMitraStatus(mitraId: string): Promise<any> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, mitraId));
    if (!profile) return undefined;

    const [updated] = await db.update(profiles)
      .set({ is_blocked: !profile.is_blocked })
      .where(eq(profiles.id, mitraId))
      .returning();

    return updated;
  }

  // Legacy compatibility methods
  async getUser(id: string): Promise<Profile | undefined> {
    return this.getProfile(id);
  }

  async getUserByUsername(username: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.email, username));
    return profile;
  }

  async createUser(user: InsertProfile & { id: string }): Promise<Profile> {
    return this.createProfile(user);
  }
}

export const storage = new DatabaseStorage();