import nodemailer from "nodemailer";

const FROM =
  process.env.EMAIL_FROM ||
  "Karmel Café & Restaurant <noreply@gmail.com>";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;
  
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  
  if (!user || !pass) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set in environment variables");
  }
  
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  
  return transporter;
}

export async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error(`[mailer] Gmail credentials missing — email NOT sent: "${subject}" -> ${to}`);
    return { id: null, error: "not_configured" as const };
  }
  
  try {
    const info = await getTransporter().sendMail({ from: FROM, to, subject, html });
    return { id: info.messageId ?? null, error: null };
  } catch (error) {
    console.error(`[mailer] send failed: "${subject}" -> ${to}:`, error);
    return { id: null, error };
  }
}

export function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function otpEmailHtml(code: string) {
  return `<div style="font-family:sans-serif;padding:24px">
    <h2>Karmel Café & Restaurant</h2>
    <p>Your email verification code is:</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:4px">${esc(code)}</p>
    <p>This code expires in 10 minutes.</p>
  </div>`;
}

export function resetPasswordHtml(link: string) {
  return `<div style="font-family:sans-serif;padding:24px">
    <h2>Karmel Café & Restaurant</h2>
    <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
    <p><a href="${link}">${link}</a></p>
  </div>`;
}

export function reservationUserHtml(r: {
  name: string; date: string; time: string; partySize: number;
}) {
  return `<div style="font-family:sans-serif;padding:24px">
    <h2>Karmel Café & Restaurant</h2>
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

export function reservationConfirmedHtml(r: {
  name: string; date: string; time: string; partySize: number;
}) {
  return `<div style="font-family:sans-serif;padding:24px">
    <h2>Karmel Café & Restaurant</h2>
    <p>Hi ${esc(r.name)}, your reservation is confirmed:</p>
    <ul>
      <li>Date: ${esc(r.date)}</li>
      <li>Time: ${esc(r.time)}</li>
      <li>Guests: ${r.partySize}</li>
    </ul>
    <p>We look forward to seeing you. Address: Schultesstraße 14, 97421 Schweinfurt.</p>
  </div>`;
}

export function reservationCancelledHtml(r: {
  name: string; date: string; time: string;
}) {
  return `<div style="font-family:sans-serif;padding:24px">
    <h2>Karmel Café & Restaurant</h2>
    <p>Hi ${esc(r.name)}, your reservation for ${esc(r.date)} at ${esc(r.time)} has been cancelled.</p>
    <p>If this wasn't expected, please contact us on 0176 21313818.</p>
  </div>`;
}

export function reservationChangeRequestHtml(r: {
  name: string; date: string; currentTime: string; proposedTime: string;
  acceptUrl: string; declineUrl: string;
}) {
  return `<div style="font-family:sans-serif;padding:24px">
    <h2>Karmel Café & Restaurant</h2>
    <p>Hi ${esc(r.name)}, we'd like to move your reservation on ${esc(r.date)}:</p>
    <p>From <strong>${esc(r.currentTime)}</strong> to <strong>${esc(r.proposedTime)}</strong></p>
    <p style="margin-top:20px">
      <a href="${r.acceptUrl}" style="background:#f59e0b;color:#000;padding:12px 20px;text-decoration:none;font-weight:bold;margin-right:10px">Accept new time</a>
      <a href="${r.declineUrl}" style="background:#333;color:#fff;padding:12px 20px;text-decoration:none;font-weight:bold">Keep original time</a>
    </p>
  </div>`;
}