import { ZodError } from 'zod';
import { Patrimony } from '../models/Patrimony.model.js';
import apiResponse from '../utils/api-response.js';
import zodErrorFormatter from '../utils/zod-error-formatter.js';
import {
	createPatrimonySchema,
	createManyPatrimoniesSchema,
	updatePatrimonySchema,
	findAllPatrimoniesSchema,
	codeSchema,
} from '../schemas/patrimony.schema.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     Patrimony:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Notebook Dell"
 *         location:
 *           type: string
 *           example: "Sala 10 - Prédio A"
 *         code:
 *           type: string
 *           example: "PAT-0001"
 *         description:
 *           type: string
 *           example: "Notebook usado pela equipe de desenvolvimento"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-09-02T09:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-09-03T12:15:00.000Z"
 *
 *   examples:
 *     ValidationErrors:
 *       summary: Erro de validação dos dados (Zod)
 *       value:
 *         success: false
 *         message: "Invalid request data"
 *         data: null
 *         code: 400
 *         errors:
 *           - path: ["name"]
 *             message: "Name is required"
 *             expected: undefined
 *
 *     DuplicateCodes:
 *       summary: Códigos duplicados no corpo da requisição
 *       value:
 *         success: false
 *         message: "Duplicate codes found in request"
 *         data: null
 *         code: 400
 *         errors:
 *           - "ABC123"
 *           - "XYZ789"
 *
 *   responses:
 *     PatrimoniesFound:
 *       description: Lista de patrimônios encontrada
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Patrimonies found successfully"
 *             code: 200
 *             data:
 *               - id: 1
 *                 name: "Notebook Dell"
 *                 location: "Sala 10 - Prédio A"
 *                 code: "PAT-0001"
 *                 description: "Notebook usado pela equipe de desenvolvimento"
 *                 created_at: "2025-09-02T09:00:00.000Z"
 *                 updated_at: "2025-09-03T12:15:00.000Z"
 *
 *     PatrimonyFound:
 *       description: Patrimônio encontrado
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Patrimony found successfully"
 *             code: 200
 *             data:
 *               id: 1
 *               name: "Notebook Dell"
 *               location: "Sala 10 - Prédio A"
 *               code: "PAT-0001"
 *               description: "Notebook usado pela equipe de desenvolvimento"
 *               created_at: "2025-09-02T09:00:00.000Z"
 *               updated_at: "2025-09-03T12:15:00.000Z"
 *
 *     PatrimonyCreated:
 *       description: Patrimônio criado com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Patrimony created successfully"
 *             code: 201
 *             data:
 *               id: 3
 *               name: "Roteador Cisco"
 *               location: "Sala Servidores"
 *               code: "PAT-0010"
 *               description: "Roteador principal"
 *               created_at: "2025-09-04T08:00:00.000Z"
 *               updated_at: "2025-09-04T08:00:00.000Z"
 *
 *     PatrimoniesCreated:
 *       description: Vários patrimônios criados com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "2 patrimonies created successfully"
 *             code: 201
 *             data:
 *               - id: 4
 *                 name: "Teclado"
 *                 location: "Sala 15"
 *                 code: "PAT-0020"
 *                 description: "Teclado mecânico"
 *                 created_at: "2025-09-04T09:00:00.000Z"
 *                 updated_at: "2025-09-04T09:00:00.000Z"
 *               - id: 5
 *                 name: "Mouse"
 *                 location: "Sala 15"
 *                 code: "PAT-0021"
 *                 description: "Mouse óptico"
 *                 created_at: "2025-09-04T09:00:00.000Z"
 *                 updated_at: "2025-09-04T09:00:00.000Z"
 *
 *     PatrimonyUpdated:
 *       description: Patrimônio atualizado com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Patrimony updated successfully"
 *             code: 200
 *             data:
 *               id: 1
 *               name: "Notebook Dell - i7"
 *               location: "Sala 10 - Prédio A"
 *               code: "PAT-0001"
 *               description: "Notebook atualizado"
 *               created_at: "2025-09-02T09:00:00.000Z"
 *               updated_at: "2025-09-05T10:00:00.000Z"
 *
 *     PatrimonyDeleted:
 *       description: Patrimônio deletado com sucesso
 *       content:
 *         application/json:
 *           example:
 *             success: true
 *             message: "Patrimony deleted successfully"
 *             code: 200
 *             data:
 *               id: 1
 *               name: "Notebook Dell"
 *               location: "Sala 10 - Prédio A"
 *               code: "PAT-0001"
 *               description: "Notebook usado pela equipe de desenvolvimento"
 *               created_at: "2025-09-02T09:00:00.000Z"
 *               updated_at: "2025-09-03T12:15:00.000Z"
 *
 *     CodeAlreadyExists:
 *       description: Código de patrimony já existe
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Patrimony code already exists"
 *             code: 409
 *             data: null
 *
 *     NotFoundPatrimony:
 *       description: Patrimônio não encontrado
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Patrimony not found"
 *             code: 404
 *             data: null
 *
 *     CodesAlreadyExist:
 *       description: Alguns códigos já existem no banco (criação em lote)
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Some patrimony codes already exist"
 *             code: 409
 *             data: null
 *             errors:
 *               existingCodes: ["PAT-0001", "PAT-0005"]
 *
 *     PatrimonyHasTickets:
 *       description: Não é possível deletar patrimony com tickets associados
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Cannot delete patrimony with associated tickets"
 *             code: 409
 *             data: null
 *
 *     InvalidRequest:
 *       description: Erro de validação dos dados (Zod)
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Invalid request data"
 *             code: 400
 *             data: null
 *             errors:
 *               - path: ["name"]
 *                 message: "Name is required"
 *                 expected: undefined
 *
 *     UnauthorizedError:
 *       description: Falha de autenticação — token ausente ou inválido
 *       content:
 *         application/json:
 *           examples:
 *             missingToken:
 *               value:
 *                 success: false
 *                 message: "Authentication token not provided."
 *                 code: 401
 *                 data: null
 *             invalidToken:
 *               value:
 *                 success: false
 *                 message: "Invalid authentication token."
 *                 code: 401
 *                 data: null
 *                 errors: "jwt malformed"
 *
 *     ForbiddenError:
 *       description: Acesso negado — usuário autenticado sem permissão
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "Access denied. You do not have permission to perform this action."
 *             code: 403
 *             data: null
 *
 *     ServerError:
 *       description: Erro inesperado do servidor
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             message: "An unexpected error occurred"
 *             code: 500
 *             data: null
 *             errors: "Error details"
 */

export class PatrimonyController {
	constructor() {}

	async create(req, res) {
		try {
			const parsed_data = createPatrimonySchema.parse(req.body);

			const patrimony = await Patrimony.create(parsed_data);

			return apiResponse(
				{
					success: true,
					message: 'Patrimony created successfully',
					data: patrimony,
					code: 201,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid request data',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			}

			if (error.message === 'CODE_ALREADY_EXISTS') {
				return apiResponse(
					{
						success: false,
						message: 'Patrimony code already exists',
						code: 409,
					},
					res,
				);
			}

			return apiResponse(
				{
					success: false,
					message: 'An unexpected error occurred',
					errors: error.message,
					code: 500,
				},
				res,
			);
		}
	}

	async createMany(req, res) {
		try {
			const parsed_data = createManyPatrimoniesSchema.parse(req.body);

			const patrimonies = await Patrimony.createMany(parsed_data);

			return apiResponse(
				{
					success: true,
					message: `${patrimonies.length} patrimonies created successfully`,
					data: patrimonies,
					code: 201,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid request data',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			}

			if (error.message === 'DUPLICATE_CODES_IN_REQUEST') {
				return apiResponse(
					{
						success: false,
						message: 'Duplicate codes found in request',
						code: 400,
					},
					res,
				);
			}

			if (error.message === 'CODES_ALREADY_EXIST') {
				return apiResponse(
					{
						success: false,
						message: 'Some patrimony codes already exist',
						errors: {
							existingCodes: error.existingCodes,
						},
						code: 409,
					},
					res,
				);
			}

			return apiResponse(
				{
					success: false,
					message: 'An unexpected error occurred',
					errors: error.message,
					code: 500,
				},
				res,
			);
		}
	}

	async findAll(req, res) {
		try {
			const parsed_data = findAllPatrimoniesSchema.parse(req.query);

			const patrimonies = await Patrimony.findAll(parsed_data);

			return apiResponse(
				{
					success: true,
					message: 'Patrimonies found successfully',
					data: patrimonies,
					code: 200,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid request data',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			}

			return apiResponse(
				{
					success: false,
					message: 'An unexpected error occurred',
					errors: error.message,
					code: 500,
				},
				res,
			);
		}
	}

	async findByCode(req, res) {
		try {
			const parsed_code = codeSchema.parse(req.params.code);

			const patrimony = await Patrimony.findByCode(parsed_code);

			return apiResponse(
				{
					success: true,
					message: 'Patrimony found successfully',
					data: patrimony,
					code: 200,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid request data',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			}

			if (error.message === 'NOT_FOUND') {
				return apiResponse(
					{
						success: false,
						message: 'Patrimony not found',
						code: 404,
					},
					res,
				);
			}

			return apiResponse(
				{
					success: false,
					message: 'An unexpected error occurred',
					errors: error.message,
					code: 500,
				},
				res,
			);
		}
	}

	async update(req, res) {
		try {
			const parsed_code = codeSchema.parse(req.params.code);
			const parsed_data = updatePatrimonySchema.parse(req.body);

			const patrimony = await Patrimony.update(parsed_code, parsed_data);

			return apiResponse(
				{
					success: true,
					message: 'Patrimony updated successfully',
					data: patrimony,
					code: 200,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid request data',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			}

			if (error.message === 'NOT_FOUND') {
				return apiResponse(
					{
						success: false,
						message: 'Patrimony not found',
						code: 404,
					},
					res,
				);
			}

			if (error.message === 'CODE_ALREADY_EXISTS') {
				return apiResponse(
					{
						success: false,
						message: 'Patrimony code already exists',
						code: 409,
					},
					res,
				);
			}

			return apiResponse(
				{
					success: false,
					message: 'An unexpected error occurred',
					errors: error.message,
					code: 500,
				},
				res,
			);
		}
	}

	async delete(req, res) {
		try {
			const parsed_code = codeSchema.parse(req.params.code);

			const patrimony = await Patrimony.delete(parsed_code);

			return apiResponse(
				{
					success: true,
					message: 'Patrimony deleted successfully',
					data: patrimony,
					code: 200,
				},
				res,
			);
		} catch (error) {
			if (error instanceof ZodError) {
				return apiResponse(
					{
						success: false,
						message: 'Invalid request data',
						errors: zodErrorFormatter(error),
						code: 400,
					},
					res,
				);
			}

			if (error.message === 'NOT_FOUND') {
				return apiResponse(
					{
						success: false,
						message: 'Patrimony not found',
						code: 404,
					},
					res,
				);
			}

			if (error.message === 'PATRIMONY_HAS_TICKETS') {
				return apiResponse(
					{
						success: false,
						message:
							'Cannot delete patrimony with associated tickets',
						code: 409,
					},
					res,
				);
			}

			return apiResponse(
				{
					success: false,
					message: 'An unexpected error occurred',
					errors: error.message,
					code: 500,
				},
				res,
			);
		}
	}
}
