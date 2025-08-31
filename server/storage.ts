import {
  users,
  gameSessions,
  transactions,
  bigWins,
  siteImages,
  type User,
  type InsertUser,
  type GameSession,
  type InsertGameSession,
  type Transaction,
  type InsertTransaction,
  type BigWin,
  type InsertBigWin,
  type SiteImage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sum } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserBalance(userId: string, newBalance: string): Promise<void>;
  
  // Game session operations
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getActiveGameSession(userId: string, gameType: string): Promise<GameSession | undefined>;
  updateGameSession(sessionId: string, updates: Partial<GameSession>): Promise<GameSession>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getAllTransactions(filters: { status?: string }): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  updateTransactionStatus(id: string, status: 'completed' | 'failed'): Promise<Transaction>;
  getPendingWithdrawalSum(userId: string): Promise<number>;
  
  // Big wins operations
  createBigWin(bigWin: InsertBigWin): Promise<BigWin>;
  getRecentBigWins(): Promise<BigWin[]>;

  // Image management operations
  getSiteImages(): Promise<SiteImage[]>;
  upsertSiteImage(key: string, url: string): Promise<SiteImage>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      mobile: users.mobile,
      password: users.password,
      firstName: users.firstName,
      lastName: users.lastName,
      referralCode: users.referralCode,
      referredBy: users.referredBy,
      balance: users.balance,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      mobile: users.mobile,
      password: users.password,
      firstName: users.firstName,
      lastName: users.lastName,
      referralCode: users.referralCode,
      referredBy: users.referredBy,
      balance: users.balance,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      mobile: users.mobile,
      password: users.password,
      firstName: users.firstName,
      lastName: users.lastName,
      referralCode: users.referralCode,
      referredBy: users.referredBy,
      balance: users.balance,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      mobile: users.mobile,
      password: users.password,
      firstName: users.firstName,
      lastName: users.lastName,
      referralCode: users.referralCode,
      referredBy: users.referredBy,
      balance: users.balance,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.referralCode, referralCode));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        mobile: users.mobile,
        password: users.password,
        firstName: users.firstName,
        lastName: users.lastName,
        referralCode: users.referralCode,
        referredBy: users.referredBy,
        balance: users.balance,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });
    return user;
  }

  async updateUserBalance(userId: string, newBalance: string): Promise<void> {
    await db
      .update(users)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      mobile: users.mobile,
      password: users.password,
      firstName: users.firstName,
      lastName: users.lastName,
      referralCode: users.referralCode,
      referredBy: users.referredBy,
      balance: users.balance,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).orderBy(desc(users.createdAt));
  }

  // Game session operations
  async createGameSession(sessionData: InsertGameSession): Promise<GameSession> {
    const [session] = await db
      .insert(gameSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getActiveGameSession(userId: string, gameType: string): Promise<GameSession | undefined> {
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(and(
        eq(gameSessions.userId, userId),
        eq(gameSessions.gameType, gameType),
        eq(gameSessions.isActive, true)
      ));
    return session;
  }

  async updateGameSession(sessionId: string, updates: Partial<GameSession>): Promise<GameSession> {
    const [session] = await db
      .update(gameSessions)
      .set(updates)
      .where(eq(gameSessions.id, sessionId))
      .returning();
    return session;
  }

  // Transaction operations
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getAllTransactions(filters: { status?: string }): Promise<Transaction[]> {
    const { status } = filters;
    const query = db.select().from(transactions).orderBy(desc(transactions.createdAt));

    if (status) {
      query.where(eq(transactions.status, status));
    }

    return await query;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async updateTransactionStatus(id: string, status: 'completed' | 'failed'): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ status, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async getPendingWithdrawalSum(userId: string): Promise<number> {
    const result = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'withdrawal'),
        eq(transactions.status, 'pending')
      ));

    return parseFloat(result[0]?.total || "0");
  }

  // Big wins operations
  async createBigWin(bigWinData: InsertBigWin): Promise<BigWin> {
    const [bigWin] = await db
      .insert(bigWins)
      .values(bigWinData)
      .returning();
    return bigWin;
  }

  async getRecentBigWins(): Promise<BigWin[]> {
    return await db
      .select()
      .from(bigWins)
      .orderBy(desc(bigWins.createdAt))
      .limit(10);
  }

  // Image management operations
  async getSiteImages(): Promise<SiteImage[]> {
    return await db.select().from(siteImages);
  }

  async upsertSiteImage(key: string, url: string): Promise<SiteImage> {
    const [image] = await db
      .insert(siteImages)
      .values({ key, url })
      .onConflictDoUpdate({ target: siteImages.key, set: { url } })
      .returning();
    return image;
  }
}

export const storage = new DatabaseStorage();
