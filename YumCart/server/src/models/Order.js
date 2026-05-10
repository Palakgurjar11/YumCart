import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
    name: String,
    image: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [(v) => Array.isArray(v) && v.length > 0, 'Order needs at least one item'],
    },
    /** Grand total charged for this order */
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryAddress: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'paid',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
