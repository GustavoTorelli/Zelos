import nodemailer from 'nodemailer';

export let transporter;

if (process.env.ENVIRONMENT === 'prod') {
	transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			type: 'OAuth2',
			user: process.env.SMTP_USER,
			clientId: process.env.SMTP_CLIENT_ID,
			clientSecret: process.env.SMTP_CLIENT_SECRET,
			refreshToken: process.env.SMTP_REFRESH_TOKEN,
		},
	});
} else {
	transporter = nodemailer.createTransport({
		host: process.env.DEV_SMTP_HOST,
		port: process.env.DEV_SMTP_PORT,
		auth: {
			user: process.env.DEV_SMTP_USER,
			pass: process.env.DEV_SMTP_PASS,
		},
	});
}
