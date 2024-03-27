const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const auth = require("./auth");

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

const responseTemplatePath = path.join(
  __dirname,
  "..",
  "views",
  "responseTempelate.ejs"
);
const responseTemplate = fs.readFileSync(responseTemplatePath, "utf8");

const responseToFounderTempelate = path.join(
  __dirname,
  "..",
  "views",
  "responseToFounder.ejs"
);
const responseToFounder = fs.readFileSync(responseToFounderTempelate, "utf8");

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
  context,
  companyBlurb,
  requestId
) {
  try {
    const messageId = generateMessageId();
    const otp = generateOTP(6);
    const token = await auth.generateJWT(blumeReference);
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Blume👻"', // sender address
      to: blumeReference?.email, // list of receivers
      subject: "Introduction Request Blume✔", // Subject line
      html: ejs.render(template, {
        recipientName:
          blumeReference?.firstName + " " + blumeReference?.lastName,
        contactName: connection?.firstName + " " + connection?.lastName,
        contactCompany: connection.company,
        contactEmail: connection.email,
        contactPosition: connection.position,
        contactLinkedInURL: connection.linkedInUrl,
        senderEmail: founder?.email,
        senderName: founder?.firstName + " " + founder?.lastName,
        recipientEmail: blumeReference?.email,
        senderEmail: founder?.email,
        senderCompany: founder?.company,
        context,
        companyBlurb,
        adminDashboardLink: `https://blume.onrender.com/ConnectionRequestsPage?connectionId=${requestId}&token=${token}`,
      }), // html body
      headers: {
        "In-Reply-To": messageId,
        References: messageId,
      },
    });

    return { messageId: info.messageId, otp };
  } catch (e) {
    console.error(e);
  }
}

function generateMessageId() {
  // Generate a unique Message-ID using timestamp and a random number
  return `<${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .substr(2, 9)}@example.com>`;
}

async function requestApprove(admin, connection) {
  try {
    const clientId =
      "775614405027-913fiotduieu2cnckd0l6o7d4djck461.apps.googleusercontent.com";
    const client_secret = "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";
    const oauth2Client = {
      clientId: clientId,
      clientSecret: client_secret,
      refreshToken: admin.refresh_token,
      accessToken: admin.access_token,
      expires: 3599,
    };
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: admin.email, // Sender's email address
        clientId: oauth2Client.clientId,
        clientSecret: oauth2Client.clientSecret,
        refreshToken: oauth2Client.refreshToken,
        accessToken: oauth2Client.accessToken,
        expires: oauth2Client.expires,
      },
    });
    const info = await transporter.sendMail({
      from: admin.email,
      to: connection?.blumeConnectionID?.email,
      subject: `Introduction ${connection?.founderID.company} <> ${connection?.blumeConnectionID?.company}`, // Subject line
      html: ejs.render(responseTemplate, {
        requestedName:
          connection?.blumeConnectionID.firstName +
          " " +
          connection?.blumeConnectionID?.lastName,
        requestorCompanyName: connection?.founderID.company,
        requestorName:
          connection?.founderID.firstName +
          " " +
          connection?.founderID?.lastName,
        companyBlurb: connection.companyBlurb,
      }), // html body
      access_type: "offline",
      // prompt: "consent",
    });

    return { messageId: info.messageId };
  } catch (e) {
    console.error(e);
  }
}

async function mailResponseToFounder(founder, connection, admin, scenario) {
  try {
    const messageId = generateMessageId();
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Blume👻"', // sender address
      to: founder?.email, // list of receivers
      subject: "Response to Introduction Request Blume✔", // Subject line
      html: ejs.render(responseToFounder, {
        requestorName: founder?.firstName + " " + founder?.lastName,
        message: generateMessage(scenario),
        connectionName: connection?.firstName + " " + connection?.lastName,
        connectionCompany: connection?.company,
      }), // html body
      headers: {
        "In-Reply-To": messageId,
        References: messageId,
      },
    });

    return { messageId: info.messageId };
  } catch (e) {
    console.error(e);
  }
}

function generateMessage(scenario) {
  switch (scenario) {
    case "approved":
      return "Yes, we will connect shortly";
    case "inReview":
      return "Will try but please proceed elsewhere if you find a better connect";
    case "declined":
      return "Sorry, unable to make an intro";
    default:
      return "";
  }
}

module.exports = {
  mailSender,
  mailSenderToConnect,
  requestApprove,
  mailResponseToFounder,
};
