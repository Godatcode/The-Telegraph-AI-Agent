import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting: 10 requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'TELEGRAPH LINE BUSY STOP TRY AGAIN STOP',
});

app.use('/api', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes will be added here

app.listen(PORT, () => {
  console.log(`Telegraph server running on port ${PORT}`);
});

export default app;
