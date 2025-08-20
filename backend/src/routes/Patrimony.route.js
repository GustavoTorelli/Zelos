import { Router } from 'express';
import { PatrimonyController } from '../controllers/Patrimony.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();
const patrimonyController = new PatrimonyController();

// Buscar todos os patrimônios (com filtros opcionais)
router.get('/', auth(), async (req, res) => {
	return await patrimonyController.findAll(req, res);
});

// Buscar patrimônio por código
router.get('/code/:code', auth(), async (req, res) => {
	return await patrimonyController.findByCode(req, res);
});

// Buscar patrimônio por ID
router.get('/:id', auth(), async (req, res) => {
	return await patrimonyController.findById(req, res);
});

// Criar um patrimônio (apenas admins)
router.post('/', auth('admin'), async (req, res) => {
	return await patrimonyController.create(req, res);
});

// Criar múltiplos patrimônios em lote (apenas admins)
router.post('/batch', auth('admin'), async (req, res) => {
	return await patrimonyController.createMany(req, res);
});

// Atualizar patrimônio (apenas admins)
router.put('/:id', auth('admin'), async (req, res) => {
	return await patrimonyController.update(req, res);
});

// Deletar patrimônio (apenas admins)
router.delete('/:id', auth('admin'), async (req, res) => {
	return await patrimonyController.delete(req, res);
});

export default router;
