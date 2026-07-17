import { getEvents } from "@/lib/google-calendar";
import { getPoolDateTimeParts, POOL_TIME_ZONE } from "@/lib/pool-time";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  // ICS format — return .ics file for Apple Calendar / iCal
  if (format === "ics") {
    const now = new Date();
    const icsStart = new Date(now);
    icsStart.setDate(icsStart.getDate() - 7);
    const icsEnd = new Date(now);
    icsEnd.setMonth(icsEnd.getMonth() + 6);

    try {
      const events = await getEvents(icsStart, icsEnd);
      const ics = buildICS(events);
      return new NextResponse(ics, {
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": 'attachment; filename="pool-cal.ics"',
          "Cache-Control": "public, max-age=300",
        },
      });
    } catch (e) {
      console.error("ICS error:", e);
      return NextResponse.json({ error: "Error al generar calendario" }, { status: 500 });
    }
  }

  // JSON format — normal events API
  if (!start || !end) {
    return NextResponse.json({ error: "start y end son requeridos" }, { status: 400 });
  }

  try {
    const events = await getEvents(new Date(start), new Date(end));
    return NextResponse.json(events, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (err: any) {
    const msg = err?.errors?.[0]?.message || err?.message || "Error del servidor";
    console.error("Calendar API error:", msg);
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatICSDate(d: Date): string {
  const parts = getPoolDateTimeParts(d);
  return `${parts.year}${pad(parts.month)}${pad(parts.day)}T${pad(parts.hour)}${pad(parts.minute)}${pad(parts.second)}`;
}

function buildICS(events: any[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pool-Cal//Residencial Ian 2//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Pool Cal - Residencial Ian 2",
    `X-WR-TIMEZONE:${POOL_TIME_ZONE}`,
    "X-PUBLISHED-TTL:PT1H",
    "BEGIN:VTIMEZONE",
    `TZID:${POOL_TIME_ZONE}`,
    `X-LIC-LOCATION:${POOL_TIME_ZONE}`,
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0400",
    "TZNAME:AST",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];

  for (const event of events) {
    const dtStart = new Date(event.start);
    const dtEnd = new Date(event.end);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@pool.erqlabs.site`,
      `DTSTART;TZID=${POOL_TIME_ZONE}:${formatICSDate(dtStart)}`,
      `DTEND;TZID=${POOL_TIME_ZONE}:${formatICSDate(dtEnd)}`,
      `SUMMARY:${event.title || "Piscina reservada"}`,
      `DESCRIPTION:Reservado por: ${event.creator}`,
      "TRANSP:OPAQUE",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
