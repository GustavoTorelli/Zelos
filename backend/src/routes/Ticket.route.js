import { Router } from 'express';
import { TicketController } from '../controllers/Ticket.controller.js';
import { WorklogController } from '../controllers/Worklog.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();
const ticketController = new TicketController();
const worklogController = new WorklogController();

// Ticket Routes
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

router.delete('/:id', auth('admin'), async (req, res) => {
	return await ticketController.delete(req, res);
});

router.patch('/:id/status', auth(), async (req, res) => {
	return await ticketController.updateStatus(req, res);
});

router.patch('/:id/assign', auth(), async (req, res) => {
	return await ticketController.assignTechnician(req, res);
});

// Worklog Routes
router.get('/:ticket_id/worklogs', auth(), (req, res) =>
	worklogController.findAll(req, res),
);

router.get('/:ticket_id/worklogs/:id', auth(), (req, res) =>
	worklogController.findById(req, res),
);

router.post('/:ticket_id/worklogs', auth(), (req, res) =>
	worklogController.create(req, res),
);

export default router;
