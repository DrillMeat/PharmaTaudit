export function ok(res, data = {}) {
  res.status(200).json({ ok: true, ...data });
}

export function fail(res, statusCode, message) {
  res.status(statusCode).json({ error: message });
}

export function methodNotAllowed(res, allowedMethods = []) {
  if (Array.isArray(allowedMethods) && allowedMethods.length) {
    res.setHeader('Allow', allowedMethods.join(', '));
  }
  fail(res, 405, 'Method not allowed');
}

