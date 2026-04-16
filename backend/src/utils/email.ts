// utils/email.ts
export const sendReportEmail = async ({
  email,
  username,
  report,
  frequency,
}: {
  email: string;
  username: string;
  report: any;
  frequency: string;
}) => {
  // For now, just log to console
  console.log(`Sending report email to ${email} (${username}) with frequency ${frequency}`);
  console.log("Report:", report);
  return true;
};