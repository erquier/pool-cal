import { auth } from "@/app/api/auth/[...nextauth]/route";
import { deleteBooking, getEvents } from "@/lib/google-calendar";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { eventId } = await request.json();

  // Verify it's the user's booking
  const now = new Date();
  const events = await getEvents(now, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
  const booking = events.find(
    (e) => e.id === eventId && e.creatorEmail === session.user?.email
  );

  if (!booking) {
    return NextResponse.json({ error: "Solo puedes cancelar tus propias reservas" }, { status: 403 });
  }

  await deleteBooking(eventId);
  return NextResponse.json({ success: true });
}
