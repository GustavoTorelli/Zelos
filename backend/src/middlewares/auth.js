import jwt from 'jsonwebtoken';
import apiResponse from '../utils/api-response.js';

export function auth(requiredRoles = null) {
	return (req, res, next) => {
		const authHeader = (req.headers && req.headers.authorization) || '';
		const tokenFromHeader = authHeader.startsWith('Bearer ')
			? authHeader.split(' ')[1]
			: null;
		const token = (req.cookies && req.cookies.jwt_token) || tokenFromHeader;

		if (!token) {
			return apiResponse(
				{
					success: false,
					message: 'Authentication token not provided.',
					code: 401,
				},
				res,
			);
		}

		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			req.user = decoded;

			if (requiredRoles) {
				const rolesArray = Array.isArray(requiredRoles)
					? requiredRoles
					: [requiredRoles];

				if (!rolesArray.includes(decoded.role)) {
					return apiResponse(
						{
							success: false,
							message:
								'Access denied. You do not have permission to perform this action.',
							code: 403,
						},
						res,
					);
				}
			}

			next();
		} catch (error) {
			return apiResponse(
				{
					success: false,
					message: 'Invalid authentication token.',
					code: 401,
					errors: error.message,
				},
				res,
			);
		}
	};
}
