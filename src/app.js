const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const plantRoutes = require("./routes/plant.routes");
const imageRoutes = require("./routes/image.routes");
const careRoutes = require("./routes/care.routes");
const growthRoutes = require("./routes/growth.routes");
const historyRoutes = require("./routes/history.routes");
const notificationRoutes = require("./routes/notification.routes");

const env = require("./config/env");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

app.use(cookieParser());

if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use(globalRateLimiter);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LeafLens API is running",
    data: {
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to LeafLens AI API",
  });
});

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/plants", plantRoutes);

app.use("/api/v1", imageRoutes);

app.use("/api/v1/care", careRoutes);

app.use("/api/v1/growth", growthRoutes);

app.use("/api/v1/history", historyRoutes);

app.use(
  "/api/v1/notifications",
  notificationRoutes
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
  });
});

// Global error handler — must remain the last middleware
app.use(errorMiddleware);

module.exports = app;