import jwt from 'jsonwebtoken';

/**
 * Signs a JWT with user id & role payload.
 * Keeps payloads small — avoid embedding PII.
 */
export function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET missing');
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET missing');
  return jwt.verify(token, secret);
}
