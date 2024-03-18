const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "puneettiwari61@gmail.com",
    pass: "egup huix uhoj uznf",
  },
});

const templatePath = path.join(
  __dirname,
  "..",
  "views",
  "requestTempelate.ejs"
);
const template = fs.readFileSync(templatePath, "utf8");

function generateOTP(length) {
  const digits = "0123456789";
  let OTP = "";

  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }

  return OTP;
}

// async..await is not allowed in global scope, must use a wrapper
async function mailSender(mail) {
  try {
    const otp = generateOTP(6);
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Blume Login OTP👻" puneettiwari61@gmail.com', // sender address
      to: mail, // list of receivers
      subject: "Blume Login OTP ✔", // Subject line
      text: `Your otp to login in Blume is ${otp}`, // plain text body
      html: `<b>Your otp to login in Blume is ${otp}</b>`, // html body
    });

    return { messageId: info.messageId, otp };
  } catch (e) {
    console.error(e);
  }
}

async function mailSenderToConnect(
  blumeReference,
  founder,
  connection,
  context
) {
  try {
    const otp = generateOTP(6);
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Blume👻"', // sender address
      to: blumeReference?.email, // list of receivers
      subject: "Introduction Request Blume✔", // Subject line
      html: ejs.render(template, {
        recipientName:
          blumeReference?.firstName + " " + blumeReference?.lastName,
        contactName: connection?.firstName + " " + connection?.lastName,
        companyName: connection.company,
        senderName: founder?.firstName + " " + founder?.lastName,
        recipientEmail: blumeReference?.email,
        context,
      }), // html body
    });

    return { messageId: info.messageId, otp };
  } catch (e) {
    console.error(e);
  }
}

module.exports = { mailSender, mailSenderToConnect };
