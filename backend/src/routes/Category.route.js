import { Router } from 'express';
import { CategoryController } from '../controllers/Category.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();
const categoryController = new CategoryController();

router.get('/', auth(), async (req, res) => {
	return await categoryController.findAll(req, res);
});

router.get('/:id', auth(), async (req, res) => {
	return await categoryController.findById(req, res);
});

router.post('/', auth('admin'), async (req, res) => {
	return await categoryController.create(req, res);
});

router.put('/:id', auth('admin'), async (req, res) => {
	return await categoryController.update(req, res);
});

router.patch('/:id/activate', auth('admin'), async (req, res) => {
	return await categoryController.activate(req, res);
});

router.patch('/:id/deactivate', auth('admin'), async (req, res) => {
	return await categoryController.deactivate(req, res);
});

export default router;
