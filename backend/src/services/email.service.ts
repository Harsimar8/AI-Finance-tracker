// src/services/email.service.ts
import nodemailer from "nodemailer";
import { getReportEmailTemplate } from "../jobs/report_template";

interface SendReportEmailDTO {
  email: string;
  username: string;
  report: any;
  frequency: string;
  attachment?: { filename: string; content: Buffer } | null;
}

export const sendReportEmail = async ({
  email,
  username,
  report,
  frequency,
  attachment = null,
}: SendReportEmailDTO) => {
  // 1️⃣ Create transporter (Gmail example)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,       // your email
      pass: process.env.SMTP_PASSWORD,    // app password or real password
    },
  });

  // 2️⃣ Compose email
  const mailOptions: any = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: `${frequency} Report`,
    html: getReportEmailTemplate(report, username, frequency),
  };

  // 3️⃣ Attach file if exists
  if (attachment) {
    mailOptions.attachments = [
      {
        filename: attachment.filename,
        content: attachment.content,
      },
    ];
  }

  // 4️⃣ Send email
  await transporter.sendMail(mailOptions);
};