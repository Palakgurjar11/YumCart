import mongoose from 'mongoose';

/** One cart document per authenticated user — line items reference Food */
const cartItemSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    /** Stored at add-to-cart time for consistent checkout totals if price changes later */
    priceAtAdd: { type: Number, required: true },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Cart', cartSchema);
