require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect Database
connectDB();

const app = express();

// Lemon Squeezy webhook must receive raw body BEFORE express.json() is applied
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/repos', require('./routes/repoRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/pr', require('./routes/prRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
