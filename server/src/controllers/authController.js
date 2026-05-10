import User from '../models/User.js';
import { signToken } from '../utils/generateToken.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Registers a normal customer account (role: user).
 * Admins should be seeded or promoted — not publicly sign-up-able for security.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, role: 'user' });
  const token = signToken({ sub: user.id, role: user.role });

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = signToken({ sub: user.id, role: user.role });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
    },
  });
});

/** Current user profile (protected route) */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, avatar } = req.body;
  const updates = {};

  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (address !== undefined) updates.address = address;
  if (avatar !== undefined) updates.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.userId, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
    },
  });
});
