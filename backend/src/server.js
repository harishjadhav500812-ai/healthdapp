import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import connectDB from "./config/database.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import recordsRoutes from "./routes/recordsRoutes.js";
import accessRoutes from "./routes/accessRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express app

// Connect to MongoDB
connectDB();

// Middleware
// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Compression
app.use(compression());

// Logging (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HealthChain API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/events", eventsRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to HealthChain API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      records: "/api/records",
      access: "/api/access",
      events: "/api/events",
      health: "/health",
    },
    documentation: "https://github.com/healthchain/api-docs",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: message,
    error:
      process.env.NODE_ENV === "development"
        ? {
            stack: err.stack,
            details: err,
          }
        : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("   🏥 HealthChain DApp Backend Server");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   Server running on port: ${PORT}`);
  console.log(`   API URL: http://localhost:${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/health`);
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully...");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});

export default app;
