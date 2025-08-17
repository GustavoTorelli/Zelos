import { transporter } from '../config/nodemailer.js';
import fs from 'fs/promises';
import path from 'path';

export async function sendResetPasswordEmail(to, token) {
	const templatePath = path.join(
		process.cwd(),
		'src',
		'resources',
		'reset-password-email.html',
	);

	const template = await fs.readFile(templatePath, 'utf-8');
	let html;

	html = template.replace(/{{TOKEN}}/g, token);
	html = html.replace(
		/{{FRONTEND_BASE_URL}}/g,
		process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
	);

	const mailOptions = {
		from: process.env.SMTP_USER,
		to,
		subject: 'Redefinição de senha - ZELOS',
		html,
	};

	await transporter.sendMail(mailOptions);
}
