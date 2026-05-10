import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as cart from '../controllers/cartController.js';

const router = Router();

router.use(protect);

router.get('/', cart.getCart);
router.post('/items', cart.addItem);
router.post('/merge', cart.mergeGuestCart);
router.patch('/items/:foodId', cart.updateQty);
router.delete('/items/:foodId', cart.removeItem);
router.delete('/', cart.clearCart);

export default router;
