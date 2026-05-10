import { Router } from 'express';
import * as foods from '../controllers/foodController.js';

const router = Router();

router.get('/', foods.listFoods);
router.get('/categories', foods.listCategories);
router.get('/:id', foods.getFoodById);

export default router;
