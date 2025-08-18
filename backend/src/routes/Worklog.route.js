import { Router } from 'express';
import { WorklogController } from '../controllers/Worklog.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();
const worklogController = new WorklogController();

router.get('/', auth(), async (req, res) => {
	return await worklogController.findAll(req, res);
});

router.get('/:id', auth(), async (req, res) => {
	return await worklogController.findById(req, res);
});

router.post('/', auth(), async (req, res) => {
	return await worklogController.create(req, res);
});
