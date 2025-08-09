import jwt from 'jsonwebtoken';

export function auth(requiredRole = null) {
	return (req, res, next) => {
		const token = req.headers.authorization?.split(' ')[1];

		if (!token) {
			res.status(401).json({
				success: false,
				message: 'Authentication token not provided.',
				data: null,
				error: null,
			});
		}

		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			req.user = decoded;

			if (requiredRole && decoded.role !== requiredRole) {
				res.status(403).json({
					success: false,
					message:
						'Access denied. You do not have permission to perform this action.',
					data: null,
					error: null,
				});
			}

			next();
		} catch (error) {
			res.status(401).json({
				success: false,
				message: 'Invalid authentication token.',
				data: null,
				error: error.message,
			});
		}
	};
}
