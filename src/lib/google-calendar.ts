import { google } from "googleapis";

function getAuth() {
  const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return auth;
}

function getCalendar() {
  return google.calendar({ version: "v3", auth: getAuth() });
}

export interface Booking {
  id: string;
  title: string;
  start: string;
  end: string;
  creator: string;
  creatorEmail: string;
}

export async function getEvents(dateStart: Date, dateEnd: Date): Promise<Booking[]> {
  const calendar = getCalendar();
  const res = await calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    timeMin: dateStart.toISOString(),
    timeMax: dateEnd.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });
  return (res.data.items || []).map((event) => {
    const desc = (event.description || "").split("|");
    return {
      id: event.id!,
      title: event.summary || "Reservado",
      start: event.start?.dateTime || event.start?.date!,
      end: event.end?.dateTime || event.end?.date!,
      creator: desc[0]?.trim() || "Alguien",
      creatorEmail: desc[1]?.trim() || "",
    };
  });
}

export async function createBooking(
  start: Date,
  end: Date,
  userName: string,
  userEmail: string
): Promise<string> {
  const calendar = getCalendar();
  const res = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    requestBody: {
      summary: `🏊 ${userName}`,
      description: `${userName} | ${userEmail}`,
      start: { dateTime: start.toISOString(), timeZone: "America/Santo_Domingo" },
      end: { dateTime: end.toISOString(), timeZone: "America/Santo_Domingo" },
      transparency: "opaque",
    },
  });
  return res.data.id!;
}

export async function deleteBooking(eventId: string) {
  const calendar = getCalendar();
  await calendar.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    eventId,
  });
}

export async function getUserBookings(
  userEmail: string,
  dateStart: Date,
  dateEnd: Date
): Promise<Booking[]> {
  const all = await getEvents(dateStart, dateEnd);
  return all.filter((b) => b.creatorEmail === userEmail);
}
