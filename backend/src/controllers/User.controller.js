import { User } from '../models/User.model.js';

export class UserController {
	// Constructor
	constructor() {}

	/**
	 * Returns all users in the database
	 * @param {Request} req - Express request object
	 * @param {Response} res - Express response object
	 * @returns {Promise<void>}
	 */
	async getAllUsers(req, res) {
		try {
			const users = await User.findAll();
			res.status(200).json({
				success: true,
				message: 'Users obtained successfully.',
				data: users,
				errors: null,
				code: 200,
			});
		} catch (error) {
			res.status(500).json({
				success: true,
				message: '',
				data: null,
				errors: error,
				code: 200,
			});
		}
	}
}
