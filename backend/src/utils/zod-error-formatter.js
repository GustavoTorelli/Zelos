export default function zodErrorFormatter(error) {
	return error.issues.map((issue) => {
		return {
			path: issue.path,
			message: issue.message,
			expected: issue.expected,
		};
	});
}
