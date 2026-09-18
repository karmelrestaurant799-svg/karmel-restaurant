import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendMail, reservationUserHtml, reservationAdminHtml } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";
import { readJson, clientIp } from "@/lib/http";

// Upper bounds only stop abusive payloads from being stored and e-mailed onward.
const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  phone: z.string().min(6).max(32),
  // An unparseable date compares as NaN >= today, i.e. false, so it is rejected
  // here with a 400 rather than reaching Prisma as an Invalid Date (500).
  date: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, { message: "Reservation date must be today or in the future" }),
  time: z.string().max(20),
  partySize: z.coerce.number().int().min(1).max(30),
  notes: z.string().max(1000).optional(),
  consent: z.boolean().refine((v) => v === true, {
    message: "You must accept the privacy policy to make a reservation.",
  }),
});

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function POST(req: NextRequest) {
  const limited = await rateLimit("register", `reservation:${clientIp(req)}`);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await readJson(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const data = parsed.data;
  const dateObj = new Date(data.date);
  const dayName = DAY_NAMES[dateObj.getDay()];

  const session = await auth();

  const reservation = await prisma.reservation.create({
    data: {
      userId: session?.user ? (session.user as { id?: string }).id : undefined,
      name: data.name,
      email: data.email,
      phone: data.phone,
      date: dateObj,
      time: data.time,
      partySize: data.partySize,
      notes: data.notes,
      consentAt: new Date(),
    },
  });

  const dateLabel = dateObj.toLocaleDateString("en-GB");

  const guestMail = await sendMail(
    data.email,
    "Reservation received — Karmel Café & Restaurant",
    reservationUserHtml({ name: data.name, date: dateLabel, time: data.time, partySize: data.partySize })
  );
  if (guestMail.error) console.error("[reservations] failed to send guest confirmation to", data.email);

  if (process.env.ADMIN_EMAIL) {
    const adminMail = await sendMail(
      process.env.ADMIN_EMAIL,
      `New reservation: ${data.name} — ${dayName} ${dateLabel} ${data.time}`,
      reservationAdminHtml({ ...data, date: dateLabel, dayName })
    );
    if (adminMail.error) console.error("[reservations] failed to send admin notification");
  }

  return NextResponse.json({ ok: true, id: reservation.id });
}

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const reservations = await prisma.reservation.findMany({
    where: { date: { gte: new Date(new Date().toDateString()) } },
    orderBy: { date: "asc" },
    take: 500,
  });
  return NextResponse.json({ reservations });
}
