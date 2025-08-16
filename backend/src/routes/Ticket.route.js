import { Router } from 'express';
import { TicketController } from '../controllers/Ticket.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();
const ticketController = new TicketController();

router.get('/', auth(), async (req, res) => {
	return await ticketController.findAll(req, res);
});

router.get('/:id', auth(), async (req, res) => {
	return await ticketController.findById(req, res);
});

router.post('/', auth(), async (req, res) => {
	return await ticketController.create(req, res);
});

router.put('/:id', auth(), async (req, res) => {
	return await ticketController.update(req, res);
});

router.patch('/:id/status', auth(), async (req, res) => {
	return await ticketController.updateStatus(req, res);
});

router.post('/:id/assign', auth(), async (req, res) => {
	return await ticketController.assignTechnician(req, res);
});

export default router;
