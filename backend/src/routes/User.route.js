import { Router } from 'express';
import { UserController } from '../controllers/User.controller.js';
import { auth } from '../middlewares/auth.js';
import apiResponse from '../utils/api-response';

const router = Router();
const userController = new UserController();

router.get(
	'/',
	auth('admin'),
	async (req, res) => await userController.getAll(req, res),
);

router.get('/:id', auth(), async (req, res) => {
	if (req.user.role !== 'admin' && Number(req.params.id) !== req.user.id) {
		return apiResponse(
			{
				success: false,
				message: 'You are not authorized to access this resource',
				code: 403,
			},
			res,
		);
	}
	return await userController.getById(req, res);
});

router.post(
	'/',
	auth('admin'),
	async (req, res) => await userController.create(req, res),
);

router.put('/:id', auth('admin'), async (req, res) => {
	if (req.user.role !== 'admin' && Number(req.params.id) !== req.user.id) {
		return apiResponse(
			{
				success: false,
				message: 'You are not authorized to access this resource',
				code: 403,
			},
			res,
		);
	}
	return await userController.update(req, res);
});

router.patch('/:id/activate', auth('admin'), async (req, res) => {
	return await userController.activate(req, res);
});

router.patch('/:id/deactivate', auth('admin'), async (req, res) => {
	return await userController.deactivate(req, res);
});

router.delete('/:id', auth('admin'), async (req, res) => {
	return await userController.delete(req, res);
});

export default router;
