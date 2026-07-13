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
import { copyFileSync, mkdirSync } from 'fs';

// Local routes and DB imports removed since they are not present in this project

const __dirname  = dirname(fileURLToPath(import.meta.url));
const PORT       = Number(process.env.PORT) || 3000;
const STATIC_DIR = resolve(__dirname, '..');
const IS_PROD    = process.env.NODE_ENV === 'production';

/* ── Validate required env vars ──────────── */
function validateEnv() {
  const required = ['ADMIN_USER', 'ADMIN_PASS'];
  const missing  = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.warn('Missing env vars — using defaults', { missing });
  }
  if (process.env.ADMIN_PASS === 'skycamp2026' && IS_PROD) {
    console.error('FATAL: Default ADMIN_PASS in production! Change it in .env');
    process.exit(1);
  }
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = randomBytes(32).toString('hex');
    console.warn('SESSION_SECRET not set — using random (sessions reset on restart)');
  }
}
validateEnv();

/* ── Initialize database ─────────────────── */
// initDb(resolve(__dirname, process.env.DB_PATH || '../data/gamestop.db'));

/* ── App ─────────────────────────────────── */
const app = express();
app.set('trust proxy', IS_PROD ? 1 : false);
app.disable('x-powered-by'); // belt + suspenders (helmet also does this)

/* ── Helmet — HTTP Security Headers ─────── */
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc:       ["'self'"],
      scriptSrc:        ["'self'", "'unsafe-inline'"],  // inline scripts for admin panel
      styleSrc:         ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc:          ["'self'", 'fonts.gstatic.com'],
      imgSrc:           ["'self'", 'data:', 'https://lh3.googleusercontent.com'],
      connectSrc:       ["'self'"],  // no external API calls from browser
      objectSrc:        ["'none'"],
      baseUri:          ["'self'"],
      formAction:       ["'self'"],
      frameAncestors:   ["'none'"],  // no iframes (clickjacking)
      upgradeInsecureRequests: IS_PROD ? [] : null,
    },
  },
  hsts: IS_PROD ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  frameguard:    { action: 'deny' },
  noSniff:       true,
  xssFilter:     true,
  dnsPrefetchControl: { allow: false },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    features: {
      camera:       ["'none'"],
      microphone:   ["'none'"],
      geolocation:  ["'none'"],
      payment:      ["'self'"],
    },
  },
}));

/* ── CORS ────────────────────────────────── */
const allowedOrigins = [
  IS_PROD
    ? (process.env.FRONTEND_URL || 'https://gamestop.netlify.app')
    : 'http://localhost:3000',
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

/* ── Cookie parser ───────────────────────── */
app.use(cookieParser(process.env.SESSION_SECRET));

/* ── Body parsing ────────────────────────── */
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

/* ── Global security middleware ──────────── */
// app.use(noParamPollution);
// app.use('/api', requireJson);
// app.use('/api', auditLog);
// app.use('/api', sanitizeBody);

/* ── Request logging ─────────────────────── */
// app.use(requestLogger);

/* ── HTTPS redirect (production) ─────────── */
if (IS_PROD) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.hostname}${req.url}`);
    }
    next();
  });
}

/* ── CSRF Token endpoint ──────────────────
   Frontend fetches this before any POST
   ─────────────────────────────────────── */
app.get('/api/csrf-token', (req, res) => {
  const token = randomBytes(32).toString('hex');
  res.cookie('csrf_token', token, {
    httpOnly: false,
    sameSite: 'strict',
    secure:   IS_PROD,
    maxAge:   4 * 60 * 60 * 1000,
  });
  res.json({ ok: true, token });
});

/* ── Health ──────────────────────────────── */
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, service: 'Sky Camp API', ts: new Date().toISOString() })
);

/* ── API Routes ──────────────────────────── */
// app.use('/api/bookings', apiLimiter, bookingLimiter, bookingsRouter);
// app.use('/api/contact',  apiLimiter, contactLimiter, contactRouter);
// app.use('/api/admin',    adminLimiter, adminRouter);

/* ── Security.txt ────────────────────────── */
app.get('/.well-known/security.txt', (_req, res) => {
  res.type('text/plain').send(
    `Contact: mailto:security@gamestop.pp.ua\n` +
    `Expires: ${new Date(Date.now() + 365*24*60*60*1000).toISOString()}\n` +
    `Preferred-Languages: uk, en\n` +
    `Policy: https://gamestop.pp.ua/security-policy\n`
  );
});

/* ── Admin Panel ──────────────────────────── */
app.get('/admin', (_req, res) =>
  res.sendFile(resolve(__dirname, 'admin.html'))
);

// Serve admin CSS/JS modules from /admin/admin/ folder
app.use('/admin', express.static(resolve(__dirname, 'admin'), {
  maxAge:   IS_PROD ? '1h' : 0,
  dotfiles: 'deny',
}));

/* ── Static files ────────────────────────── */
app.use(express.static(STATIC_DIR, {
  maxAge:    IS_PROD ? '7d' : 0,
  etag:      true,
  lastModified: true,
  index:     'index.html',
  dotfiles:  'deny',    // block .env, .git etc
  setHeaders(res, path) {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
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

/* ── Start ───────────────────────────────── */
app.listen(PORT, '0.0.0.0', () => {
  console.log('GameStop backend started', { port: PORT, env: IS_PROD ? 'production' : 'development' });
  console.log(`\n🏕️  GameStop backend (secure)`);
  console.log(`   🌐  http://localhost:${PORT}`);
  console.log(`   🔧  http://localhost:${PORT}/api/health`);
  console.log(`   👤  http://localhost:${PORT}/admin`);
  console.log(`   🔒  Mode: ${IS_PROD ? 'PRODUCTION' : 'development'}\n`);
});

/* ── DB Backup (daily at 03:00) ──────────── */
// Backup disabled as getDb is not available

export default app;
