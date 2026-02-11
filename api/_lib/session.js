import crypto from 'node:crypto';

const SESSION_COOKIE_NAME = 'pharmat_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-only-change-me';

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const normalized = padded + '='.repeat((4 - (padded.length % 4)) % 4);
  return Buffer.from(normalized, 'base64').toString('utf8');
}

function timingSafeEqualString(a, b) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function sign(payload) {
  const digest = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64');
  return base64UrlEncode(digest);
}

function parseCookieHeader(header = '') {
  return header
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const [name, ...rest] = part.split('=');
      if (!name) return cookies;
      cookies[name] = decodeURIComponent(rest.join('='));
      return cookies;
    }, {});
}

export function createSessionToken({ email, role }) {
  const payload = {
    email,
    role,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000
  };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token) return null;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;
  const expected = sign(payloadB64);
  if (!timingSafeEqualString(expected, signature)) return null;
  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch (error) {
    return null;
  }
  if (!payload?.email || !payload?.role || !payload?.exp) return null;
  if (Date.now() > payload.exp) return null;
  return payload;
}

export function serializeSessionCookie(token) {
  const isProduction = process.env.NODE_ENV === 'production';
  const attributes = [
    `${SESSION_COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`
  ];
  if (isProduction) attributes.push('Secure');
  return attributes.join('; ');
}

export function setSessionCookie(res, session) {
  const token = createSessionToken(session);
  res.setHeader('Set-Cookie', serializeSessionCookie(token));
  return token;
}

export function clearSessionCookie(res) {
  const isProduction = process.env.NODE_ENV === 'production';
  const attributes = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0'
  ];
  if (isProduction) attributes.push('Secure');
  res.setHeader('Set-Cookie', attributes.join('; '));
}

export function getSession(req) {
  const cookies = req?.cookies || parseCookieHeader(req?.headers?.cookie);
  return verifySessionToken(cookies?.[SESSION_COOKIE_NAME]);
}

