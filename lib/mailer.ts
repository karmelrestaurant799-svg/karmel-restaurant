import { Resend } from "resend";

const FROM =
  process.env.EMAIL_FROM ||
  "Karmel Café & Restaurant <onboarding@resend.dev>";

let resend: Resend | null = null;

function getResend(): Resend {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  resend = new Resend(key);
  return resend;
}

export async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error(`[mailer] RESEND_API_KEY missing — email NOT sent: "${subject}" -> ${to}`);
    return { id: null, error: "not_configured" as const };
  }
  // A network failure/timeout throws rather than returning { error }. Callers
  // (e.g. register) have already written to the DB by this point, so surface it
  // as a normal error result instead of a 500 that leaves a half-finished signup.
  try {
    const { data, error } = await getResend().emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error(`[mailer] send failed: "${subject}" -> ${to}:`, error);
      return { id: null, error };
    }
    return { id: data?.id ?? null, error: null };
  } catch (err) {
    console.error(`[mailer] send threw: "${subject}" -> ${to}:`, err);
    return { id: null, error: err };
  }
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function otpEmailHtml(code: string) {
  return `<div style="font-family:sans-serif;padding:24px">
    <h2>Karmel Café &amp; Restaurant</h2>
    <p>Your email verification code is:</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:4px">${esc(code)}</p>
    <p>This code expires in 10 minutes.</p>
  </div>`;
}

export function resetPasswordHtml(link: string) {
  return `<div style="font-family:sans-serif;padding:24px">
    <h2>Karmel Café &amp; Restaurant</h2>
    <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
    <p><a href="${link}">${link}</a></p>
  </div>`;
}

export function reservationUserHtml(r: {
  name: string; date: string; time: string; partySize: number;
}) {
  return `<div style="font-family:sans-serif;padding:24px">
    <h2>Karmel Café &amp; Restaurant</h2>
    <p>Hi ${esc(r.name)}, your table reservation request has been received:</p>
    <ul>
      <li>Date: ${esc(r.date)}</li>
      <li>Time: ${esc(r.time)}</li>
      <li>Guests: ${r.partySize}</li>
    </ul>
    <p>We will confirm shortly. Address: Schultesstraße 14, 97421 Schweinfurt.</p>
  </div>`;
}

export function reservationAdminHtml(r: {
  name: string; email: string; phone: string; date: string; time: string;
  partySize: number; dayName: string; notes?: string;
}) {
  return `<div style="font-family:sans-serif;padding:24px">
    <h2>New Reservation</h2>
    <ul>
      <li>Name: ${esc(r.name)}</li>
      <li>Email: ${esc(r.email)}</li>
      <li>Phone: ${esc(r.phone)}</li>
      <li>Day: ${esc(r.dayName)}</li>
      <li>Date: ${esc(r.date)}</li>
      <li>Time: ${esc(r.time)}</li>
      <li>Guests: ${r.partySize}</li>
      <li>Notes: ${r.notes ? esc(r.notes) : "-"}</li>
    </ul>
  </div>`;
}
