export const ROLE_EMPLOYEE = 'employee';
export const ROLE_RGA = 'rga';

export function hasRole(session, role) {
  return (session?.role || '').toLowerCase() === role;
}

export function requireAuth(session) {
  if (!session) {
    return { status: 401, message: 'Unauthorized' };
  }
  return null;
}

export function requireRole(session, role) {
  if (!session) {
    return { status: 401, message: 'Unauthorized' };
  }
  if (!hasRole(session, role)) {
    return { status: 403, message: 'Forbidden' };
  }
  return null;
}

