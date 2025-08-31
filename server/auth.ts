import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { type User, registerUserSchema, loginUserSchema } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email: string | null;
      mobile: string;
      firstName: string | null;
      lastName: string | null;
      balance: string | null;
      createdAt: Date | null;
      updatedAt: Date | null;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "default-secret-key-for-development",
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({ 
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true 
    }),
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          const user = await storage.getUserByUsername(username);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid username or password" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists (if provided)
      if (validatedData.email) {
        const existingEmail = await storage.getUserByEmail(validatedData.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      // Handle referral code
      let referredBy = null;
      if (validatedData.referralCode) {
        const referrer = await storage.getUserByReferralCode(validatedData.referralCode);
        if (referrer) {
          referredBy = referrer.id;
        }
      }

      // Create user with hashed password
      const hashedPassword = await hashPassword(validatedData.password);
      const userData = {
        username: validatedData.username,
        email: validatedData.email,
        mobile: validatedData.mobile,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        referralCode: validatedData.referralCode,
        referredBy,
        balance: "1000", // Give new users 1000 USDT to start
      };

      const user = await storage.createUser(userData);

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: user.id,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          firstName: user.firstName,
          lastName: user.lastName,
          balance: user.balance,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ 
            message: info?.message || "Invalid username or password" 
          });
        }
        
        req.login(user, (err) => {
          if (err) return next(err);
          res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            firstName: user.firstName,
            lastName: user.lastName,
            balance: user.balance,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          });
        });
      })(req, res, next);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.sendStatus(401);
    }
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      mobile: req.user.mobile,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      balance: req.user.balance,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    });
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}