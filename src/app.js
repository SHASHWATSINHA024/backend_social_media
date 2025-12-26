const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const logger = require("./utils/logger");
const { connectDB } = require("./utils/database");
const { initScheduler } = require("./services/scheduler");

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const likeRoutes = require("./routes/likes");
const commentRoutes = require("./routes/comments");

/**
 * Express application setup
 */
const app = express();
const PORT = process.env.PORT || 3000;

/* -------------------- Middleware -------------------- */

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* -------------------- Routes -------------------- */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Root
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Social Media Backend API is running",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      users: "/api/users",
      posts: "/api/posts",
      likes: "/api/likes",
      comments: "/api/comments",
    },
  });
});

/* -------------------- Error Handling -------------------- */

// Global error handler
app.use((err, req, res, next) => {
  logger.critical("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      details: err.message,
    }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* -------------------- Server Startup -------------------- */

const startServer = async () => {
  try {
    await connectDB();
    initScheduler();

    app.listen(PORT, () => {
      logger.verbose(`Server running on port ${PORT}`);
      logger.verbose(
        `Environment: ${process.env.NODE_ENV || "development"}`
      );
    });
  } catch (error) {
    logger.critical("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
