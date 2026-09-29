import nodemailer from "nodemailer";

type Mail = { to: string; subject: string; text: string; html: string };

const transport = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      // Port 465 uses implicit TLS; other ports upgrade with STARTTLS.
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
  : null;

/**
 * Sends through SMTP when configured. Without SMTP settings the message is
 * printed to the server log instead, so local development needs no setup.
 */
export async function sendMail(mail: Mail) {
  const from = process.env.EMAIL_FROM ?? "Threadline <orders@localhost>";
  if (!transport) {
    console.log(`[email not sent: SMTP_HOST unset] to=${mail.to} subject="${mail.subject}"\n${mail.text}`);
    return;
  }
  await transport.sendMail({ from, ...mail });
}
