import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for local authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique(),
  mobile: varchar("mobile").notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  referralCode: varchar("referral_code"),
  referredBy: varchar("referred_by"),
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0"),
  role: varchar("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const siteImages = pgTable("site_images", {
  key: varchar("key").primaryKey(),
  url: text("url").notNull(),
});

// Game sessions for tracking player games
export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameType: varchar("game_type").notNull(), // 'mines', 'crash', 'plinko', etc.
  betAmount: decimal("bet_amount", { precision: 20, scale: 8 }).notNull(),
  multiplier: decimal("multiplier", { precision: 10, scale: 4 }).default("0"),
  payout: decimal("payout", { precision: 20, scale: 8 }).default("0"),
  isActive: boolean("is_active").default(true),
  gameData: jsonb("game_data"), // Store game-specific data like mine positions
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Transactions for deposits/withdrawals
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // 'deposit', 'withdrawal', 'bet', 'win'
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  currency: varchar("currency").notNull(), // 'USDT', 'BTC', 'ETH', etc.
  status: varchar("status").default("pending"), // 'pending', 'completed', 'failed'
  method: varchar("method"), // 'crypto', 'upi'
  address: text("address"), // Wallet address or UPI ID
  txHash: varchar("tx_hash"), // Transaction hash for crypto
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Big wins for the recent wins display
export const bigWins = pgTable("big_wins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameType: varchar("game_type").notNull(),
  betAmount: decimal("bet_amount", { precision: 20, scale: 8 }).notNull(),
  winAmount: decimal("win_amount", { precision: 20, scale: 8 }).notNull(),
  multiplier: decimal("multiplier", { precision: 10, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertUser = typeof users.$inferInsert;
export type User = {
  id: string;
  username: string;
  email: string | null;
  mobile: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  referralCode: string | null;
  referredBy: string | null;
  balance: string | null;
  role: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type InsertGameSession = typeof gameSessions.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;

export type InsertTransaction = typeof transactions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;

export type InsertBigWin = typeof bigWins.$inferInsert;
export type BigWin = typeof bigWins.$inferSelect;

export type SiteImage = typeof siteImages.$inferSelect;

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  referredBy: true,
});

export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
