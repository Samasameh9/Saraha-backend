import nodemailer from "nodemailer";
import { APP_EMAIL, APP_PASSWORD } from "../../../config.js";
import { BadRequestException } from "../../exception/error.exception.js";

export const userEmailKey=({email,subject})=>{
    return `User::${email}::${subject}_otp`
}

export const userEmailOtpTrialsKey=({email,subject})=>{
    return `User::${email}::${subject}_otp_trials`
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: APP_EMAIL,
    pass: APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendEmail({
  to,
  cc,
  bcc,
  subject,
  text,
  html,
  attachments = [],
} = {}) {
  try {
    if (!to?.length && !cc?.length && !bcc?.length) {
      throw BadRequestException("invalid recipient");
    }
    if (!text?.length && !html?.length && !attachments?.length) {
      throw BadRequestException("invalid email content");
    }
    const info = await transporter.sendMail({
      from: `"sama" <${APP_EMAIL}>`,
      to,
      cc,
      bcc,
      subject, 
      text,
      html,
      attachments,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.log(err);

    console.error("Error while sending mail:", err);
  }
}
