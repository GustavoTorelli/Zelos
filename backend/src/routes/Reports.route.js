import { Router } from 'express';
import { ReportController } from '../controllers/Report.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();
const reportController = new ReportController();

router.get('/', async (req, res) => {
	return await reportController.generate(req, res);
});

export default router;
