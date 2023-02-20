require("dotenv").config();
const nodemailer = require("nodemailer");
async function sendCreateContractEmail(email, Data) {
  const body_html = `
    <!DOCTYPE html>
    <html>
    <body>
    <h1>Insurance Smart Contract</h1>
    <p id="Descriptions">Descriptions : นี่คือสัญญาประกันภัยรถยนต์แบบ Smart Contract หากท่านสยินยอมในข้อตกลงที่สามารถกดยินยอมในปุ่ม Accept หากไม่ยินยอมให้กดปุ่ม Refuse </p>
    <p id="Data">Data : ${Data}</p>
    <p id="Result"></p>
    <button type="button" onclick="Accept()" style="background-color:DodgerBlue">Accept</button>
    <button type="button" onclick="Refuse()" style="background-color:Tomato">Refuse</button>
    <script>
    function Accept() {
      document.getElementById("Result").style.fontSize = "25px"; 
      document.getElementById("Result").innerText  = "Accept success";
      document.getElementById("Result").style.color = "white";
      document.getElementById("Result").style.backgroundColor = "Tomato";        
    }
    function Refuse() {
      document.getElementById("Result").style.fontSize = "25px"; 
      document.getElementById("Result").innerText  = "Refuse success ";
      document.getElementById("Result").style.color = "white";
      document.getElementById("Result").style.backgroundColor = "MediumSeaGreen";        
    }
    </script>
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
    await transporter.sendMail(mailOptions);
    return { error: false };
  } catch (error) {
    console.error("send-email-error", error);
    return {
      error: true,
      message: "Cannot send email",
    };
  }
}
module.exports = { sendCreateContractEmail };
