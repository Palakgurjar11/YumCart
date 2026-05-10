import Food from '../models/Food.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/** Public catalogue — supports ?category=&search=&page=&limit= */
export const listFoods = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 24));
  const skip = (page - 1) * limit;

  const searchTerm = (search || '').trim();

  /** Combine availability, optional category filter, and optional fuzzy search */
  const andConditions = [{ isAvailable: true }];
  if (category && category !== 'All') andConditions.push({ category });
  if (searchTerm) {
    andConditions.push({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
      ],
    });
  }

  const query = andConditions.length === 1 ? andConditions[0] : { $and: andConditions };

  const [foods, total] = await Promise.all([
    Food.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
    Food.countDocuments(query),
  ]);

  res.json({
    success: true,
    foods,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  });
});

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Food.distinct('category', { isAvailable: true });
  res.json({ success: true, categories: ['All', ...categories.sort()] });
});

export const getFoodById = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id).lean();
  if (!food) {
    return res.status(404).json({ success: false, message: 'Food not found' });
  }
  res.json({ success: true, food });
});
