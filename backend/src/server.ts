import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { SubscriptionService } from './services/subscription.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GREENA ESG API is running' });
});

// Serve frontend static files (production only)
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

// Marca assinaturas vencidas como expiradas no boot e a cada hora
const subscriptionService = new SubscriptionService();
const EXPIRATION_SWEEP_INTERVAL_MS = 60 * 60 * 1000;

function sweepExpiredSubscriptions() {
  subscriptionService
    .expireOverdueSubscriptions()
    .catch((error) => console.error('[SUBSCRIPTION] Falha ao expirar assinaturas:', error.message));
}

// Start server
app.listen(PORT, () => {
  sweepExpiredSubscriptions();
  setInterval(sweepExpiredSubscriptions, EXPIRATION_SWEEP_INTERVAL_MS).unref();

  console.log(`\n🌱 GREENA ESG Backend`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  console.log(`\n📝 Env: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
