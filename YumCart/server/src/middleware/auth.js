import User from '../models/User.js';
import { verifyToken } from '../utils/generateToken.js';

/**
 * Verifies Bearer JWT and attaches req.userId & req.role
 */
export async function protect(req, res, next) {
  try {
    const auth = req.headers.authorization;
    let token;

    if (auth && auth.startsWith('Bearer ')) {
      token = auth.slice(7);
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized — missing token' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub).select('role');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.userId = decoded.sub;
    req.role = user.role;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

/** Restrict route to admins */
export function adminOnly(req, res, next) {
  if (req.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}
