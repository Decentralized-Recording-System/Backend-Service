require('dotenv').config();
const nodemailer = require('nodemailer');
async function sendEmail (email, code) {
	try {
		const smtpEndpoint = 'smtp.gmail.com';
		const port = 465;
		const senderAddress = 'nathaphon.nindy@gmail.com';
		var toAddress = email;
		const smtpUsername = 'nathaphon.nindy@gmail.com';
		const smtpPassword = process.env.MAIL_APIKEY_awata;
		var subject = 'Verify your email';
		// The body of the email for recipients
		var body_html = `<!DOCTYPE> 
    <html>
	<script src="https://smtpjs.com/v3/smtp.js">
	</script>
      <body>
        <p>Your authentication code is : </p> <b>${code}</b>
      </body>
    </html>`;
		// Create the SMTP transport.
		let transporter = nodemailer.createTransport({
			host: smtpEndpoint,
			port: port,
			secure: true, // true for 465, false for other ports
			auth: {
				user: smtpUsername,
				pass: smtpPassword,
			},
		});
		// Specify the fields in the email.
		let mailOptions = {
			from: senderAddress,
			to: toAddress,
			subject: subject,
			html: body_html,
		};
		let info = await transporter.sendMail(mailOptions);
		return { error: false };
	} catch (error) {
		console.error('send-email-error', error);
		return {
			error: true,
			message: 'Cannot send email',
		};
	}
}
module.exports = { sendEmail };
