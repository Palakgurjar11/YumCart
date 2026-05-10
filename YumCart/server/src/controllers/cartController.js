import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Food from '../models/Food.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/** Ensure a cart exists for user — lazily creates empty cart */
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.food');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate('items.food');
  }
  return cart;
}

/** GET /cart — full cart with populated foods */
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.userId);
  res.json({ success: true, cart });
});

/** POST /cart/items { foodId, quantity } */
export const addItem = asyncHandler(async (req, res) => {
  const { foodId, quantity = 1 } = req.body;
  if (!foodId || !mongoose.isValidObjectId(foodId)) {
    return res.status(400).json({ success: false, message: 'Valid foodId required' });
  }

  const food = await Food.findById(foodId);
  if (!food || !food.isAvailable) {
    return res.status(404).json({ success: false, message: 'Food not available' });
  }

  const qty = Math.max(1, Math.min(99, Number(quantity) || 1));
  const cart = await getOrCreateCart(req.userId);

  const idx = cart.items.findIndex((i) => i.food.toString() === foodId);
  if (idx >= 0) {
    cart.items[idx].quantity += qty;
    cart.items[idx].priceAtAdd = food.price;
  } else {
    cart.items.push({
      food: food._id,
      quantity: qty,
      priceAtAdd: food.price,
    });
  }

  await cart.save();
  await cart.populate('items.food');

  res.json({ success: true, cart });
});

/** PATCH /cart/items/:foodId — set absolute quantity */
export const updateQty = asyncHandler(async (req, res) => {
  const { foodId } = req.params;
  const { quantity } = req.body;
  const qty = Number(quantity);

  if (!Number.isFinite(qty) || qty < 1 || qty > 99) {
    return res.status(400).json({ success: false, message: 'Quantity must be between 1 and 99' });
  }

  const cart = await getOrCreateCart(req.userId);
  const idx = cart.items.findIndex((i) => i.food.toString() === foodId);
  if (idx < 0) {
    return res.status(404).json({ success: false, message: 'Item not in cart' });
  }

  cart.items[idx].quantity = qty;
  const food = await Food.findById(foodId);
  if (food) cart.items[idx].priceAtAdd = food.price;

  await cart.save();
  await cart.populate('items.food');

  res.json({ success: true, cart });
});

/** DELETE /cart/items/:foodId */
export const removeItem = asyncHandler(async (req, res) => {
  const { foodId } = req.params;

  const cart = await Cart.findOne({ user: req.userId });
  if (!cart) return res.json({ success: true, cart: null });

  cart.items = cart.items.filter((i) => i.food.toString() !== foodId);
  await cart.save();
  await cart.populate('items.food');

  res.json({ success: true, cart });
});

/** Clear cart after checkout */
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.userId }, { items: [] });
  res.json({ success: true, message: 'Cart cleared' });
});

/**
 * Merge guest-cart lines from client after JWT login —
 * body: { items: [{ foodId, quantity }] }
 */
export const mergeGuestCart = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    const cart = await getOrCreateCart(req.userId);
    return res.json({ success: true, cart });
  }

  const cart = await getOrCreateCart(req.userId);

  for (const row of items) {
    const { foodId, quantity = 1 } = row || {};
    if (!foodId || !mongoose.isValidObjectId(foodId)) continue;

    const food = await Food.findById(foodId);
    if (!food || !food.isAvailable) continue;

    const qty = Math.max(1, Math.min(99, Number(quantity) || 1));
    const idx = cart.items.findIndex((i) => i.food.toString() === foodId.toString());
    if (idx >= 0) {
      cart.items[idx].quantity += qty;
      cart.items[idx].priceAtAdd = food.price;
    } else {
      cart.items.push({ food: food._id, quantity: qty, priceAtAdd: food.price });
    }
  }

  await cart.save();
  await cart.populate('items.food');

  res.json({ success: true, cart });
});
