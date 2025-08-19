export default function apiResponse(
	{ success, message, data = null, errors = null, code },
	res,
) {
	return res.status(code).json({
		success,
		message,
		data,
		errors,
	});
}
