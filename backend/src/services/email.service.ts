// src/services/email.service.ts
import nodemailer from "nodemailer";
import { Env } from "../config/env.config";

interface SendReportEmailDTO {
  email: string;
  username: string;
  report: any;
  frequency: string;
  attachment?: { filename: string; content: Buffer } | null;
}

const getReportEmailTemplate = (report: any, username: string, frequency: string) => {
  const topCategories = report.topSpendingCategories || report.summary?.topCategories || [];
  const categoriesHtml = topCategories.length > 0
    ? `<div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Top Categories</h3>
        ${topCategories.map((cat: any) => `<p>${cat.name}: ${cat.amount} (${cat.percent}%)</p>`).join('')}
      </div>`
    : '';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Monthly Financial Report</h1>
      <p>Hello <strong>${username}</strong>,</p>
      <p>Here's your ${frequency} financial summary:</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Summary</h2>
        <p><strong>Total Income:</strong> ${report.totalIncome || report.summary?.income || 0}</p>
        <p><strong>Total Expenses:</strong> ${report.totalExpenses || report.summary?.expenses || 0}</p>
        <p><strong>Available Balance:</strong> ${report.availableBalance || report.summary?.balance || 0}</p>
        <p><strong>Savings Rate:</strong> ${report.savingsRate || report.summary?.savingsRate || 0}%</p>
      </div>
      
      ${categoriesHtml}
      
      <p style="color: #64748b; font-size: 14px;">Best regards,<br/>Finance App Team</p>
    </div>
  `;
};

export const sendReportEmail = async ({
  email,
  username,
  report,
  frequency,
  attachment = null,
}: SendReportEmailDTO) => {
  const html = getReportEmailTemplate(report, username, frequency);
  
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