const DEFAULT_ORIGINS = [
  'https://app.gbma.tech',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

function cleanEnvVar(value) {
  if (!value) return value;
  return value.replace(/^["']|["']$/g, '').trim();
}

function normalizeOrigin(origin) {
  if (!origin) return '';
  return origin.trim().replace(/\/+$/, '');
}

function isGbmaTechOrigin(origin) {
  try {
    const { protocol, hostname } = new URL(origin);
    return protocol === 'https:' && (hostname === 'gbma.tech' || hostname.endsWith('.gbma.tech'));
  } catch {
    return false;
  }
}

export function buildCorsOptions(envOrigin) {
  const configured = cleanEnvVar(envOrigin);
  const parsed = configured
    ? configured.split(',').map(normalizeOrigin).filter(Boolean)
    : [];

  const allowedOrigins = [...new Set([...parsed, ...DEFAULT_ORIGINS])];

  const isAllowed = (origin) => {
    const normalized = normalizeOrigin(origin);
    return allowedOrigins.includes(normalized) || isGbmaTechOrigin(normalized);
  };

  return {
    allowedOrigins,
    options: {
      origin(origin, callback) {
        if (!origin || isAllowed(origin)) {
          callback(null, true);
          return;
        }
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
  };
}
