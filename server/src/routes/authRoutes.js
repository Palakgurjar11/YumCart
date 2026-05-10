import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import * as auth from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
}

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest,
  ],
  auth.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
  ],
  auth.login
);

router.get('/me', protect, auth.getProfile);

router.patch(
  '/me',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().isString(),
    body('address').optional().isString(),
    body('avatar').optional().isString(),
    validateRequest,
  ],
  auth.updateProfile
);

export default router;
