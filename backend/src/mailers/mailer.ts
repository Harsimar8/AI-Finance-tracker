import { Env } from "../config/env.config";
import { Resend } from "resend";

type Params = {
    to: string | string[];
    subject: string;
    text: string;
    html: string;
    from?: string;
};

const resend = new Resend(Env.RESEND_API_KEY);

const mailer_sender = `Fnora <${Env.RESEND_MAILER_SENDER}>`;

export const sendEmail = async ({
    to,
    from = mailer_sender,
    subject,
    text,
    html,
}: Params) => {
    return resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to], // ✅ fixed
        subject,
        text,
        html,
    });
};