import path from 'path';
import fs from 'fs';
import Food from '../models/Food.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const uploadsDir = path.join(process.cwd(), 'uploads', 'foods');

/** Create food — image path from Multer middleware when file uploaded */
export const createFood = asyncHandler(async (req, res) => {
  const { name, description, price, category, rating } = req.body;

  /** Fallback hero image when admin omits upload — replace with CDN in production if desired */
  let imageUrl =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
  if (req.file) {
    /** req.file.filename set by Multer disk storage */
    imageUrl = `/uploads/foods/${req.file.filename}`;
  }

  const food = await Food.create({
    name,
    description: description ?? '',
    price: Number(price),
    category,
    rating: rating !== undefined ? Number(rating) : 4.5,
    image: imageUrl,
    isAvailable: true,
  });

  res.status(201).json({ success: true, food });
});

export const updateFood = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) return res.status(404).json({ success: false, message: 'Food not found' });

  const updates = {};
  ['name', 'description', 'category', 'rating', 'price', 'isAvailable'].forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  if (updates.price !== undefined) updates.price = Number(updates.price);
  if (updates.rating !== undefined) updates.rating = Number(updates.rating);

  if (req.file) {
    if (food.image?.startsWith('/uploads/foods/')) {
      const oldRelative = food.image.replace(/^\/uploads\/foods\//, '');
      if (oldRelative && oldRelative !== 'placeholder.jpg') {
        const oldPath = path.join(uploadsDir, oldRelative);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }
    updates.image = `/uploads/foods/${req.file.filename}`;
  }

  Object.assign(food, updates);
  await food.save();

  res.json({ success: true, food });
});

export const deleteFood = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) return res.status(404).json({ success: false, message: 'Food not found' });

  if (food.image?.startsWith('/uploads/foods/')) {
    const rel = food.image.replace(/^\/uploads\/foods\//, '');
    if (rel && rel !== 'placeholder.jpg') {
      const fp = path.join(uploadsDir, rel);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
  }

  await food.deleteOne();
  res.json({ success: true, message: 'Food deleted' });
});

export const listAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, orders });
});

export const patchOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
});

/** Dashboard aggregates */
export const getStats = asyncHandler(async (req, res) => {
  const [userCount, orderAgg, ordersCount] = await Promise.all([
    User.countDocuments(),
    Order.aggregate([
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalAmount' },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$totalAmount', 0] },
          },
        },
      },
    ]),
    Order.countDocuments(),
  ]);

  const stats = orderAgg[0] || { revenue: 0, delivered: 0 };

  res.json({
    success: true,
    stats: {
      totalUsers: userCount,
      totalOrders: ordersCount,
      totalSales: stats.revenue,
      deliveredRevenue: stats.delivered,
    },
  });
});

/** Bulk list for admin catalogue (includes unavailable items) */
export const listAllFoodsAdmin = asyncHandler(async (req, res) => {
  const foods = await Food.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, foods });
});
