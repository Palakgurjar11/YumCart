import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/** Create order from current server cart snapshot */
export const createOrder = asyncHandler(async (req, res) => {
  const { deliveryAddress } = req.body;
  const cart = await Cart.findOne({ user: req.userId }).populate('items.food');

  if (!cart || !cart.items.length) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  const orderItems = [];
  let total = 0;

  for (const line of cart.items) {
    const food = line.food;
    if (!food || !food.isAvailable) continue;
    const unit = line.priceAtAdd ?? food.price;
    const sub = unit * line.quantity;
    total += sub;
    orderItems.push({
      foodId: food._id,
      name: food.name,
      image: food.image,
      quantity: line.quantity,
      unitPrice: unit,
    });
  }

  if (!orderItems.length) {
    return res.status(400).json({ success: false, message: 'No valid items to order' });
  }

  /** Optional: clamp total with live prices — already used priceAtAdd from cart lines */
  const order = await Order.create({
    user: req.userId,
    items: orderItems,
    totalAmount: Math.round(total * 100) / 100,
    deliveryAddress: deliveryAddress ?? '',
    status: 'pending',
    paymentStatus: 'paid',
  });

  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, order });
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, orders });
});
