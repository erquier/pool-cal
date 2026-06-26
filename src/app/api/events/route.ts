import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getEvents } from "@/lib/google-calendar";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  if (!start || !end) {
    return NextResponse.json({ error: "start y end son requeridos" }, { status: 400 });
  }

  const events = await getEvents(new Date(start), new Date(end));
  return NextResponse.json(events);
}
