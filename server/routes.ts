import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertGameSessionSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // Auth middleware
  setupAuth(app);

  // Game session routes
  app.post('/api/games/mines/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { betAmount, minesCount } = req.body;

      // Validate input
      if (!betAmount || !minesCount || minesCount < 1 || minesCount > 24) {
        return res.status(400).json({ message: "Invalid bet amount or mines count" });
      }

      // Check user balance
      const user = await storage.getUser(userId);
      const userBalance = user?.balance || "0";
      if (!user || parseFloat(userBalance) < parseFloat(betAmount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Generate mine positions
      const minePositions = new Set<number>();
      while (minePositions.size < minesCount) {
        minePositions.add(Math.floor(Math.random() * 25));
      }

      // Create game session
      const gameSession = await storage.createGameSession({
        userId,
        gameType: 'mines',
        betAmount,
        gameData: {
          minesCount,
          minePositions: Array.from(minePositions),
          revealedCells: [],
          safeCount: 0,
        },
      });

      // Deduct bet amount from balance
      const currentBalance = user.balance || "0";
      const newBalance = (parseFloat(currentBalance) - parseFloat(betAmount)).toString();
      await storage.updateUserBalance(userId, newBalance);

      // Create bet transaction
      await storage.createTransaction({
        userId,
        type: 'bet',
        amount: betAmount,
        currency: 'USDT',
        status: 'completed',
      });

      res.json({ 
        sessionId: gameSession.id,
        minesCount,
        safeCount: 25 - minesCount,
      });
    } catch (error) {
      console.error("Error starting mines game:", error);
      res.status(500).json({ message: "Failed to start game" });
    }
  });

  app.post('/api/games/mines/reveal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { sessionId, cellIndex } = req.body;

      const session = await storage.getActiveGameSession(userId, 'mines');
      if (!session || session.id !== sessionId) {
        return res.status(404).json({ message: "Game session not found" });
      }

      const gameData = session.gameData as any;
      const { minePositions, revealedCells } = gameData;

      if (revealedCells.includes(cellIndex)) {
        return res.status(400).json({ message: "Cell already revealed" });
      }

      const isMine = minePositions.includes(cellIndex);
      const newRevealedCells = [...revealedCells, cellIndex];

      if (isMine) {
        // Game over - player hit a mine
        await storage.updateGameSession(sessionId, {
          isActive: false,
          completedAt: new Date(),
          gameData: {
            ...gameData,
            revealedCells: newRevealedCells,
            gameOver: true,
          },
        });

        res.json({
          cellType: 'mine',
          gameOver: true,
          multiplier: 0,
          payout: 0,
        });
      } else {
        // Safe cell - calculate multiplier
        const safeRevealed = newRevealedCells.filter(cell => !minePositions.includes(cell)).length;
        const totalSafeCells = 25 - minePositions.length;
        const multiplier = calculateMinesMultiplier(safeRevealed, minePositions.length);
        const payout = parseFloat(session.betAmount) * multiplier;

        await storage.updateGameSession(sessionId, {
          multiplier: multiplier.toString(),
          payout: payout.toString(),
          gameData: {
            ...gameData,
            revealedCells: newRevealedCells,
            safeCount: safeRevealed,
          },
        });

        res.json({
          cellType: 'gem',
          gameOver: false,
          multiplier,
          payout,
          safeRevealed,
          totalSafeCells,
        });
      }
    } catch (error) {
      console.error("Error revealing cell:", error);
      res.status(500).json({ message: "Failed to reveal cell" });
    }
  });

  app.post('/api/games/mines/cashout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { sessionId } = req.body;

      const session = await storage.getActiveGameSession(userId, 'mines');
      if (!session || session.id !== sessionId) {
        return res.status(404).json({ message: "Game session not found" });
      }

      const payout = parseFloat(session.payout || "0");
      const multiplier = parseFloat(session.multiplier || "0");

      // End the game session
      await storage.updateGameSession(sessionId, {
        isActive: false,
        completedAt: new Date(),
      });

      if (payout > 0) {
        // Update user balance
        const user = await storage.getUser(userId);
        const currentBalance = user?.balance || "0";
        const newBalance = (parseFloat(currentBalance) + payout).toString();
        await storage.updateUserBalance(userId, newBalance);

        // Create win transaction
        await storage.createTransaction({
          userId,
          type: 'win',
          amount: payout.toString(),
          currency: 'USDT',
          status: 'completed',
        });

        // Create big win record if significant
        if (payout >= 100) {
          await storage.createBigWin({
            userId,
            gameType: 'mines',
            betAmount: session.betAmount,
            winAmount: payout.toString(),
            multiplier: multiplier.toString(),
          });
        }
      }

      res.json({
        success: true,
        payout,
        multiplier,
      });
    } catch (error) {
      console.error("Error cashing out:", error);
      res.status(500).json({ message: "Failed to cash out" });
    }
  });

  // Get recent big wins
  app.get('/api/big-wins', async (req, res) => {
    try {
      const bigWins = await storage.getRecentBigWins();
      res.json(bigWins);
    } catch (error) {
      console.error("Error fetching big wins:", error);
      res.status(500).json({ message: "Failed to fetch big wins" });
    }
  });

  // Transaction routes
  app.post('/api/transactions/deposit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { amount, currency, method, address } = req.body;

      const transaction = await storage.createTransaction({
        userId,
        type: 'deposit',
        amount,
        currency,
        method,
        address,
        status: 'pending',
      });

      res.json(transaction);
    } catch (error) {
      console.error("Error creating deposit:", error);
      res.status(500).json({ message: "Failed to create deposit" });
    }
  });

  app.post('/api/transactions/withdraw', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { amount, currency, address } = req.body;

      // Check user balance
      const user = await storage.getUser(userId);
      const userBalance = user?.balance || "0";
      if (!user || parseFloat(userBalance) < parseFloat(amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Deduct amount from balance
      const currentBalance = user.balance || "0";
      const newBalance = (parseFloat(currentBalance) - parseFloat(amount)).toString();
      await storage.updateUserBalance(userId, newBalance);

      const transaction = await storage.createTransaction({
        userId,
        type: 'withdrawal',
        amount,
        currency,
        address,
        status: 'pending',
      });

      res.json(transaction);
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      res.status(500).json({ message: "Failed to create withdrawal" });
    }
  });

  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate mines multiplier
function calculateMinesMultiplier(safeCells: number, minesCount: number): number {
  if (safeCells === 0) return 1;
  
  const totalCells = 25;
  const safeCellsTotal = totalCells - minesCount;
  
  // Basic multiplier calculation based on risk
  let multiplier = 1;
  for (let i = 1; i <= safeCells; i++) {
    multiplier *= (safeCellsTotal - i + 1) / (totalCells - i - minesCount + 1);
  }
  
  return Math.round(multiplier * 100) / 100;
}
