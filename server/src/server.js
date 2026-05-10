import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/** CORS for SPA origin — tighten to CLIENT_URL only */
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

/** Request logging useful in development and behind reverse proxies in prod */
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

/** Static serving for uploaded dish images — path matches Multer folder */
const uploadsRoot = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsRoot));

/** Healthcheck for uptime monitors / orchestrators */
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`YumCart API listening on http://localhost:${PORT}`);
});
