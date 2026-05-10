import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as orders from '../controllers/orderController.js';

const router = Router();

router.use(protect);

router.post('/', orders.createOrder);
router.get('/my', orders.listMyOrders);

export default router;
