// utils/email.ts
import { sendReportEmail as sendEmail } from "../services/email.service";

export const sendReportEmail = async ({
  email,
  username,
  report,
  frequency,
  attachment,
}: {
  email: string;
  username: string;
  report: any;
  frequency: string;
  attachment?: { filename: string; content: Buffer } | null;
}) => {
  try {
    await sendEmail({ email, username, report, frequency, attachment });
    console.log(`✅ Report email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send report email to ${email}:`, error);
    return false;
  }
};