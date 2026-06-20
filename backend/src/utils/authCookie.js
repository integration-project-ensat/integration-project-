const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'access_token';
const AUTH_COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function getCookieOptions() {
  const sameSite = process.env.AUTH_COOKIE_SAMESITE || 'lax';
  const secure =
    process.env.AUTH_COOKIE_SECURE === 'true' ||
    (isProduction() && sameSite.toLowerCase() === 'none');

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
    path: '/',
    ...(process.env.AUTH_COOKIE_DOMAIN
      ? { domain: process.env.AUTH_COOKIE_DOMAIN }
      : {})
  };
}

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, entry) => {
    const separatorIndex = entry.indexOf('=');
    if (separatorIndex === -1) return cookies;

    const key = entry.slice(0, separatorIndex).trim();
    const value = entry.slice(separatorIndex + 1).trim();
    if (!key) return cookies;

    try {
      cookies[key] = decodeURIComponent(value);
    } catch {
      cookies[key] = value;
    }
    return cookies;
  }, {});
}

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...getCookieOptions(),
    maxAge: undefined
  });
}

function getAuthTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  const cookies = parseCookies(req.headers.cookie);
  return cookies[AUTH_COOKIE_NAME] || null;
}

module.exports = {
  AUTH_COOKIE_NAME,
  setAuthCookie,
  clearAuthCookie,
  getAuthTokenFromRequest
};
