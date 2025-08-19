import jwt from 'jsonwebtoken';
import apiResponse from '../utils/api-response.js';

export function auth(requiredRole = null) {
	return (req, res, next) => {
		const token =
			req.cookies?.jwt_token || req.headers?.authorization.split(' ')[1];

		if (!token) {
			apiResponse(
				{
					success: false,
					message: 'Authentication token not provided.',
					code: 401,
				},
				res,
			);
			return;
		}

		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			req.user = decoded;

			if (requiredRole && decoded.role !== requiredRole) {
				apiResponse(
					{
						success: false,
						message:
							'Access denied. You do not have permission to perform this action.',
						code: 403,
					},
					res,
				);
				return;
			}

			next();
		} catch (error) {
			apiResponse(
				{
					success: false,
					message: 'Invalid authentication token.',
					code: 401,
					errors: error.message,
				},
				res,
			);
			return;
		}
	};
}
