import { auth } from "./api/auth/[...nextauth]/route";
import { getEvents } from "@/lib/google-calendar";
import CalendarClient from "./CalendarClient";
import PoolInfo from "./PoolInfo";

export const dynamic = "force-dynamic";

function getWeekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default async function Home() {
  const session = await auth();
  const weekStart = getWeekStart(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  let initialEvents: any[] = [];
  try {
    initialEvents = await getEvents(weekStart, weekEnd);
  } catch (e) {
    console.error("Error fetching initial events:", e);
  }

  const weekStartStr = weekStart.toISOString();

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-4 md:p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            🏊 Pool-Cal
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Residencial Ian 2
          </p>
        </div>
        {session?.user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-7 h-7 rounded-full ring-2 ring-blue-100"
                />
              )}
              <span className="text-sm font-medium text-gray-700">
                {session.user.name}
              </span>
            </div>
          </div>
        )}
      </header>

      <CalendarClient
        initialEvents={initialEvents}
        userEmail={session?.user?.email || null}
        userName={session?.user?.name || null}
        initialWeekStart={weekStartStr}
      />

      <PoolInfo />
    </div>
  );
}
