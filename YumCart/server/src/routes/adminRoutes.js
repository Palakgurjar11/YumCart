import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { uploadFoodImage } from '../middleware/upload.js';
import * as admin from '../controllers/adminController.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/stats', admin.getStats);

router.route('/foods').get(admin.listAllFoodsAdmin);
router.post('/foods', uploadFoodImage.single('image'), admin.createFood);
router.route('/foods/:id').patch(uploadFoodImage.single('image'), admin.updateFood).delete(admin.deleteFood);

router.get('/orders', admin.listAllOrders);
router.patch('/orders/:id/status', admin.patchOrderStatus);

export default router;
