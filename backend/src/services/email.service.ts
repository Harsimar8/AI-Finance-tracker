// src/services/email.service.ts
import nodemailer from "nodemailer";
import { Env } from "../config/env.config";
import { getReportEmailTemplate } from "../mailers/templates/report_templates";

interface SendReportEmailDTO {
  email: string;
  username: string;
  report: any;
  frequency: string;
  attachment?: { filename: string; content: Buffer } | null;
  aiSuggestions?: string;
}

export const sendReportEmail = async ({
  email,
  username,
  report,
  frequency,
  attachment = null,
  aiSuggestions,
}: SendReportEmailDTO) => {
  const html = getReportEmailTemplate(
    {
      username,
      ...report,
    },
    frequency,
    aiSuggestions
  );
  
  console.log("Email Service - Using Gmail SMTP");
  console.log("Email Service - Sending to:", email);

  try {
    // Use Gmail SMTP with app password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions: any = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: `${frequency} Financial Report`,
      html,
    };

    if (attachment) {
      mailOptions.attachments = [{
        filename: attachment.filename,
        content: attachment.content,
      }];
    }

    const result = await transporter.sendMail(mailOptions);
    console.log("Gmail SMTP response:", result);
  } catch (err: any) {
    console.error("Gmail SMTP error:", err?.message || err);
    throw err;
  }
};