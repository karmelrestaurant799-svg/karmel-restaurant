import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail, esc } from "@/lib/mailer";

// `message` embeds guest-supplied fields (e.g. the reservation time), so escape at the
// single sink; otherwise this page (served from our own origin) is a stored-XSS vector.
function page(title: string, message: string) {
  title = esc(title);
  message = esc(message);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head>
  <body style="font-family:sans-serif;background:#0a0a0a;color:#e7e5e4;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
    <div style="text-align:center;max-width:420px;padding:24px">
      <h1 style="color:#f59e0b">${title}</h1>
      <p>${message}</p>
    </div>
  </body></html>`;
}

function isApiRequest(req: NextRequest) {
  return req.headers.get("accept")?.includes("application/json") || 
         req.headers.get("content-type")?.includes("application/json");
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const action = req.nextUrl.searchParams.get("action");

  const apiRequest = isApiRequest(req);

  if (!token || (action !== "accept" && action !== "decline")) {
    if (apiRequest) return NextResponse.json({ error: "Invalid token or action" }, { status: 400 });
    return new NextResponse(page("Invalid link", "This link is not valid."), { headers: { "Content-Type": "text/html" } });
  }

  const reservation = await prisma.reservation.findUnique({ where: { responseToken: token } });
  if (!reservation) {
    if (apiRequest) return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
    return new NextResponse(
      page("Link already used", "This request has already been responded to, or the link has expired."),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const dateLabel = new Date(reservation.date).toLocaleDateString("en-GB");

  if (action === "accept" && reservation.requestedTime) {
    const newTime = new Date(reservation.requestedTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { time: newTime, status: "CONFIRMED", requestedTime: null, responseToken: null },
    });
    if (process.env.ADMIN_EMAIL) {
      await sendMail(process.env.ADMIN_EMAIL, `${reservation.name} accepted the new time`, `<p>${esc(reservation.name)} accepted ${esc(newTime)} on ${esc(dateLabel)}.</p>`);
    }
    if (apiRequest) return NextResponse.json({ reservation: { ...reservation, time: newTime, status: "CONFIRMED" } });
    return new NextResponse(
      page("Time confirmed", `Your reservation on ${dateLabel} is now set for ${newTime}. See you then!`),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: "PENDING", requestedTime: null, responseToken: null },
  });
  if (process.env.ADMIN_EMAIL) {
    await sendMail(process.env.ADMIN_EMAIL, `${reservation.name} declined the proposed time`, `<p>${esc(reservation.name)} kept the original time (${esc(reservation.time)}) on ${esc(dateLabel)}. Please follow up.</p>`);
  }
  if (apiRequest) return NextResponse.json({ reservation: { ...reservation, status: "PENDING" } });
  return new NextResponse(
    page("Original time kept", `We've kept your original reservation time (${reservation.time} on ${dateLabel}). We'll be in touch if needed.`),
    { headers: { "Content-Type": "text/html" } }
  );
}