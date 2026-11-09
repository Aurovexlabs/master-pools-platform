import { Router } from 'express';
import { uploadImage, uploadMultiple, deleteImage, getAuthParams, upload } from '../controllers/upload.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { uploadRateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();
router.use(protect);
router.use(uploadRateLimit);

// Signing parameters allow a client to upload directly to ImageKit, bypassing
// this server's validation. Staff only.
router.get('/auth', adminOnly, getAuthParams);

// Customers attach property photographs to a quotation, so /single stays open
// to any signed-in account — validated and rate limited.
router.post('/single', upload.single('image'), uploadImage);
router.post('/multiple', adminOnly, upload.array('images', 20), uploadMultiple);
router.delete('/', adminOnly, deleteImage);

export default router;
