import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const client = getResendClient();

  if (!client) {
    return;
  }

  await client.emails.send({
    from: "Golf & Giving <no-reply@digitalheroes.co.in>",
    to,
    subject,
    html,
  });
}
