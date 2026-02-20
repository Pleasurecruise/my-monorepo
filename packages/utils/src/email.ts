import { createLoggerWithContext } from "@my-monorepo/logger";
import nodemailer from "nodemailer";

const logger = createLoggerWithContext("email");

export interface SendEmailOptions {
	to: string;
	subject: string;
	text?: string;
	html?: string;
}

const transporter = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: Number(process.env.MAIL_PORT ?? 587),
	secure: process.env.MAIL_SECURE === "true",
	auth: {
		user: process.env.MAIL_AUTH_USER,
		pass: process.env.MAIL_AUTH_PASS,
	},
});

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
	try {
		const info = await transporter.sendMail({
			from: process.env.MAIL_FROM,
			to,
			subject,
			text,
			html,
		});
		return { success: true, messageId: info.messageId };
	} catch (error) {
		logger.error("Error sending email:", { error });
		return { success: false, error };
	}
}
