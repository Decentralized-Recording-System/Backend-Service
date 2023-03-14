require("dotenv").config();
const nodemailer = require("nodemailer");

const sendCreateContractEmail = async (email, Data) => {
  const body_html = `
    <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Car Insurance Contract</title>
        <link rel="stylesheet" type="text/css" href="styles.css">
      </head>
      <body>
        <h1>Car Insurance Contract</h1>
        <form method="post" action="http://localhost:3000/submit">
          <label for="name">Name:</label>
          <input type="text" name="name" required>
          <br>
          <label for="description">Description:</label>
          <textarea name="description" required>${Data}</textarea>
          <br>
          <label for="info">Contract Information:</label>
          <textarea name="info" required></textarea>
          <br>
          <input type="submit" value="Submit">
          <input type="button" value="Cancel" onclick="location.href='http://localhost:3000/cancel';">
        </form>
      </body>
      </html>
    `;

  try {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 465;
    const senderAddress = "nathaphon.nindy@gmail.com";
    var toAddress = email;
    const smtpUsername = "nathaphon.nindy@gmail.com";
    const smtpPassword = process.env.MAIL_APIKEY_awata;
    var subject = "Verify your email";
    let transporter = nodemailer.createTransport({
      host: smtpEndpoint,
      port: port,
      secure: true,
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });

    let mailOptions = {
      from: senderAddress,
      to: toAddress,
      subject: subject,
      html: body_html,
    };
    await transporter.sendMail(mailOptions);
    return { error: false };
  } catch (error) {
    console.error("send-email-error", error);
    return {
      error: true,
      message: "Cannot send email",
    };
  }
};

module.exports = { sendCreateContractEmail };
