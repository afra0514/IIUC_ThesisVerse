const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const { seedDatabase } = require('./config/seed');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supervisorRoutes = require('./routes/supervisorRoutes');
const requestRoutes = require('./routes/requestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const contentRoutes = require('./routes/contentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev to avoid CORS friction
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Root Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'IIUC ThesisVerse API Server',
    database: 'MongoDB Atlas Connected',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/supervisors', supervisorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// Connect to Database and start server
const startServer = async () => {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`[IIUC ThesisVerse] Server is running on port ${PORT}`);
    console.log(`[IIUC ThesisVerse] API base: http://localhost:${PORT}/api`);
  });
};

startServer();

module.exports = app;