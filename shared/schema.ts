import { pgTable, text, uuid, boolean, decimal, integer, timestamp, date, time, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Profiles table - main user table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  full_name: text("full_name"),
  phone: text("phone"),
  role: text("role").notNull().default("user"), // 'user', 'mitra', 'admin'
  is_verified: boolean("is_verified").default(false),
  is_blocked: boolean("is_blocked").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// User profiles table - user specific data
export const userProfiles = pgTable("user_profiles", {
  user_id: uuid("user_id").primaryKey().references(() => profiles.id, { onDelete: "cascade" }),
  address: text("address"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
});

// Mitra profiles table - service provider specific data
export const mitraProfiles = pgTable("mitra_profiles", {
  mitra_id: uuid("mitra_id").primaryKey().references(() => profiles.id, { onDelete: "cascade" }),
  is_active: boolean("is_active").default(false),
  service_types: text("service_types").array().default([]),
  profile_image: text("profile_image"),
  description: text("description"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
});

// Mitra verifications table
export const mitraVerifications = pgTable("mitra_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  mitra_id: uuid("mitra_id").references(() => profiles.id, { onDelete: "cascade" }),
  ktp_image: text("ktp_image"),
  kk_image: text("kk_image"),
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  rejection_reason: text("rejection_reason"),
  submitted_at: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
  reviewed_at: timestamp("reviewed_at", { withTimezone: true }),
  reviewed_by: uuid("reviewed_by").references(() => profiles.id),
});

// Services table
export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  base_price: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  duration_minutes: integer("duration_minutes").notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  mitra_id: uuid("mitra_id").references(() => profiles.id),
  service_id: uuid("service_id").references(() => services.id),
  service_name: text("service_name").notNull(),
  total_price: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  duration_minutes: integer("duration_minutes").notNull(),
  scheduled_date: date("scheduled_date").notNull(),
  scheduled_time: time("scheduled_time").notNull(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  payment_method: text("payment_method").notNull(), // 'balance', 'cash'
  status: text("status").default("pending"), // 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'
  notes: text("notes"),
  rating: integer("rating"),
  review: text("review"),
  started_at: timestamp("started_at", { withTimezone: true }),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  invoice_url: text("invoice_url"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Vouchers table
export const vouchers = pgTable("vouchers", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  discount_amount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull(),
  is_active: boolean("is_active").default(true),
  usage_limit: integer("usage_limit"),
  used_count: integer("used_count").default(0),
  valid_until: date("valid_until"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Voucher usage table
export const voucherUsage = pgTable("voucher_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  voucher_id: uuid("voucher_id").references(() => vouchers.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  used_at: timestamp("used_at", { withTimezone: true }).defaultNow(),
});

// Banners table
export const banners = pgTable("banners", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  image_url: text("image_url").notNull(),
  link_url: text("link_url"),
  order_index: integer("order_index").notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sender_id: uuid("sender_id").references(() => profiles.id, { onDelete: "cascade" }),
  receiver_id: uuid("receiver_id").references(() => profiles.id, { onDelete: "cascade" }),
  order_id: uuid("order_id").references(() => orders.id),
  message: text("message").notNull(),
  is_read: boolean("is_read").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Balance transactions table
export const balanceTransactions = pgTable("balance_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'topup', 'payment', 'commission', 'voucher', 'withdrawal', 'transfer'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  order_id: uuid("order_id").references(() => orders.id),
  voucher_id: uuid("voucher_id").references(() => vouchers.id),
  status: text("status").default("approved"), // 'pending', 'approved', 'rejected'
  approved_by: uuid("approved_by").references(() => profiles.id),
  approved_at: timestamp("approved_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Top Up Requests table
export const topUpRequests = pgTable("topup_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  approved_by: uuid("approved_by").references(() => profiles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  approved_at: timestamp("approved_at", { withTimezone: true }),
});

// Relations
export const profilesRelations = relations(profiles, ({ one, many }) => ({
  userProfile: one(userProfiles, {
    fields: [profiles.id],
    references: [userProfiles.user_id],
  }),
  mitraProfile: one(mitraProfiles, {
    fields: [profiles.id],
    references: [mitraProfiles.mitra_id],
  }),
  orders: many(orders),
  sentMessages: many(chatMessages, { relationName: "sender" }),
  receivedMessages: many(chatMessages, { relationName: "receiver" }),
  balanceTransactions: many(balanceTransactions),
  voucherUsages: many(voucherUsage),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  profile: one(profiles, {
    fields: [userProfiles.user_id],
    references: [profiles.id],
  }),
}));

export const mitraProfilesRelations = relations(mitraProfiles, ({ one }) => ({
  profile: one(profiles, {
    fields: [mitraProfiles.mitra_id],
    references: [profiles.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(profiles, {
    fields: [orders.user_id],
    references: [profiles.id],
    relationName: "userOrders",
  }),
  mitra: one(profiles, {
    fields: [orders.mitra_id],
    references: [profiles.id],
    relationName: "mitraOrders",
  }),
  service: one(services, {
    fields: [orders.service_id],
    references: [services.id],
  }),
  chatMessages: many(chatMessages),
  balanceTransactions: many(balanceTransactions),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  orders: many(orders),
}));

export const vouchersRelations = relations(vouchers, ({ many }) => ({
  usages: many(voucherUsage),
  balanceTransactions: many(balanceTransactions),
}));

export const voucherUsageRelations = relations(voucherUsage, ({ one }) => ({
  voucher: one(vouchers, {
    fields: [voucherUsage.voucher_id],
    references: [vouchers.id],
  }),
  user: one(profiles, {
    fields: [voucherUsage.user_id],
    references: [profiles.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  sender: one(profiles, {
    fields: [chatMessages.sender_id],
    references: [profiles.id],
    relationName: "sender",
  }),
  receiver: one(profiles, {
    fields: [chatMessages.receiver_id],
    references: [profiles.id],
    relationName: "receiver",
  }),
  order: one(orders, {
    fields: [chatMessages.order_id],
    references: [orders.id],
  }),
}));

export const balanceTransactionsRelations = relations(balanceTransactions, ({ one }) => ({
  user: one(profiles, {
    fields: [balanceTransactions.user_id],
    references: [profiles.id],
  }),
  order: one(orders, {
    fields: [balanceTransactions.order_id],
    references: [orders.id],
  }),
  voucher: one(vouchers, {
    fields: [balanceTransactions.voucher_id],
    references: [vouchers.id],
  }),
  approvedBy: one(profiles, {
    fields: [balanceTransactions.approved_by],
    references: [profiles.id],
  }),
}));

export const topUpRequestsRelations = relations(topUpRequests, ({ one }) => ({
  user: one(profiles, {
    fields: [topUpRequests.user_id],
    references: [profiles.id],
  }),
  approvedBy: one(profiles, {
    fields: [topUpRequests.approved_by],
    references: [profiles.id],
  }),
}));

// Insert schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  user_id: true,
});

export const insertMitraProfileSchema = createInsertSchema(mitraProfiles).omit({
  mitra_id: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  created_at: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  created_at: true,
  started_at: true,
  completed_at: true,
});

export const insertVoucherSchema = createInsertSchema(vouchers).omit({
  id: true,
  created_at: true,
});

export const insertBannerSchema = createInsertSchema(banners).omit({
  id: true,
  created_at: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  created_at: true,
});

export const insertBalanceTransactionSchema = createInsertSchema(balanceTransactions).omit({
  id: true,
  created_at: true,
  approved_at: true,
});

export const insertTopUpRequestSchema = createInsertSchema(topUpRequests).omit({
  id: true,
  created_at: true,
  approved_at: true,
});

// Export types
export type Profile = typeof profiles.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type MitraProfile = typeof mitraProfiles.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Voucher = typeof vouchers.$inferSelect;
export type VoucherUsage = typeof voucherUsage.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type BalanceTransaction = typeof balanceTransactions.$inferSelect;
export type TopUpRequest = typeof topUpRequests.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertMitraProfile = z.infer<typeof insertMitraProfileSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertBalanceTransaction = z.infer<typeof insertBalanceTransactionSchema>;
export type InsertTopUpRequest = z.infer<typeof insertTopUpRequestSchema>;

// Legacy compatibility
export const users = profiles;
export type User = Profile;
export type InsertUser = InsertProfile;
export const insertUserSchema = insertProfileSchema;
