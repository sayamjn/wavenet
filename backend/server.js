require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { setupSocket } = require('./utils/socket');
const { setupCronJobs } = require('./utils/cronJobs');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'CollabNotes API is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

setupSocket(server);

setupCronJobs();

process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});