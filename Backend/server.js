// =============================================
//  GameStop — Secure Server
// =============================================
import 'dotenv/config';
import express      from 'express';
import helmet       from 'helmet';
import cors         from 'cors';
import cookieParser from 'cookie-parser';
import { resolve, dirname } from 'path';
import { fileURLToPath }    from 'url';
import { randomBytes }      from 'crypto';
import bcrypt from 'bcrypt';
import prisma from './prisma.js';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const PORT       = Number(process.env.PORT) || 3000;
const IS_PROD    = process.env.NODE_ENV === 'production';
const STATIC_DIR = IS_PROD ? resolve(__dirname, '../dist') : resolve(__dirname, '..');

/* ── Validate required env vars ──────────── */
function validateEnv() {
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = randomBytes(32).toString('hex');
    console.warn('SESSION_SECRET not set — using random (sessions reset on restart)');
  }
}
validateEnv();

const app = express();
app.set('trust proxy', IS_PROD ? 1 : false);
app.disable('x-powered-by');

/* ── Helmet — HTTP Security Headers ─────── */
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc:       ["'self'"],
      scriptSrc:        ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      styleSrc:         ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
      fontSrc:          ["'self'", 'fonts.gstatic.com'],
      imgSrc:           ["'self'", 'data:', 'https://lh3.googleusercontent.com'],
      connectSrc:       ["'self'", 'https://cdn.jsdelivr.net'],
      objectSrc:        ["'none'"],
      baseUri:          ["'self'"],
      formAction:       ["'self'"],
      frameAncestors:   ["'none'"],
      upgradeInsecureRequests: IS_PROD ? [] : null,
    },
  },
  hsts: IS_PROD ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  frameguard:    { action: 'deny' },
  noSniff:       true,
  xssFilter:     true,
  dnsPrefetchControl: { allow: false },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

const allowedOrigins = [
  IS_PROD ? (process.env.FRONTEND_URL || 'https://gamestop.pp.ua') : 'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    cb(null, false);
  },
  methods:     ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true,
  maxAge:      600,
}));

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

/* ── HTTPS redirect (production) ─────────── */
if (IS_PROD) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.hostname}${req.url}`);
    }
    next();
  });
}

/* ── Security Middleware for dev ─────────── */
app.use((req, res, next) => {
  const forbidden = ['/.env', '/Backend', '/prisma', '/package.json', '/build.sh', '/.idea', '/node_modules'];
  if (req.path.startsWith('/node_modules/bootstrap')) return next();
  if (!IS_PROD && forbidden.some(p => req.path.startsWith(p))) {
    return res.status(403).send('Forbidden');
  }
  next();
});

/* ── Health ──────────────────────────────── */
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, service: 'GameStop', ts: new Date().toISOString() })
);

/* ── Authentication API ──────────────────── */
const MOCK_2FA_CODE = '123456';

app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ ok: false, error: 'Missing fields' });
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { username, email, passwordHash } });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: 'User already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }
    res.json({ ok: true, message: '2FA code required' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  const { email, code, generatedCode } = req.body;
  if (code !== MOCK_2FA_CODE && (!generatedCode || code !== generatedCode)) {
    return res.status(401).json({ ok: false, error: 'Invalid code' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ ok: false, error: 'User not found' });
  
  res.cookie('session_id', user.id, { httpOnly: true, secure: IS_PROD });
  res.json({ ok: true, user: { username: user.username, email: user.email } });
});

/* ── Static files ────────────────────────── */
app.use(express.static(STATIC_DIR, {
  maxAge:    IS_PROD ? '7d' : 0,
  etag:      true,
  lastModified: true,
  index:     'index.html',
  dotfiles:  'deny',
  setHeaders(res, path) {
    if (path.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  },
}));

/* ── 404 ──────────────────────────────────── */
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ ok: false, error: 'Endpoint not found' });
  }
  res.sendFile(resolve(STATIC_DIR, 'index.html'));
});

/* ── Error handler ───────────────────────── */
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  console.error(`[ERROR] ${req.method} ${req.path} — ${err.message}`);
  res.status(status).json({
    ok:    false,
    error: IS_PROD && status === 500 ? 'Internal server error' : err.message,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('GameStop backend started', { port: PORT, env: IS_PROD ? 'production' : 'development' });
  console.log(`\n🏕️  GameStop backend (secure)`);
  console.log(`   🌐  http://localhost:${PORT}`);
});
export default app;
