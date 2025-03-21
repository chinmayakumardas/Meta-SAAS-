require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const logger = require('./helpers/logger.helper');
const { PORT } = require('./config/appConfig');

// Connect to MongoDB
connectDB();

// Start server with error handling
const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle server-specific errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Please use a different port.`);
        process.exit(1);
      } else {
        logger.error('Server error:', error);
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! Shutting down...');
      logger.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('UNCAUGHT EXCEPTION! Shutting down...');
      logger.error(err.name, err.message);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
