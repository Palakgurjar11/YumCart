import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    /** Display rating (0–5) — can be updated by reviews in a future iteration */
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    /** Public URL path e.g. /uploads/foods/xyz.webp — populated after Multer upload */
    image: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Food', foodSchema);
