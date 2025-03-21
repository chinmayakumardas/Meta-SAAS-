require('dotenv').config(); // Load environment variables FIRST
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { SESSION_SECRET, MONGO_URI } = require('./config/appConfig');
const { errorHandler } = require('./middlewares/errorHandler.middleware');
const logger = require('./helpers/logger.helper');

const app = express();

// Security middlewares
app.use(helmet()); // Secure HTTP headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
  credentials: true
}));

// Performance middleware
app.use(compression()); // Compress responses

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', { stream: logger.stream }));

// Session configuration
const sessionConfig = {
  secret: SESSION_SECRET,
  store: MongoStore.create({ 
    mongoUrl: MONGO_URI,
    collectionName: 'sessions'
  }),
  name: 'sid', // Change session cookie name from default 'connect.sid'
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only use secure in production
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
};

// Session management
app.use(session(sessionConfig));

// API routes
const routes = require('./routes/index');
app.use('/api/v1', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found',
    path: req.originalUrl 
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
