const session = require('express-session');
const MongoStore = require('connect-mongo');
const { SESSION_SECRET, MONGO_URI, NODE_ENV } = require('./appConfig');

module.exports = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // Session TTL in seconds (24 hours)
    autoRemove: 'native', // Enable automatic removal of expired sessions
    touchAfter: 24 * 3600 // Only update session if 24 hours have passed
  }),
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    sameSite: 'strict'
  },
  name: 'sessionId', // Change session cookie name from default 'connect.sid'
  rolling: true // Reset maxAge on every response
});
