import { auth } from "./api/auth/[...nextauth]/route";
import { getEvents } from "@/lib/google-calendar";
import {
  addDaysToDateKey,
  getPoolWeekStartDateKey,
  poolDateTime,
} from "@/lib/pool-time";
import CalendarClient from "./CalendarClient";
import PoolInfo from "./PoolInfo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const weekStartKey = getPoolWeekStartDateKey();
  const weekStart = poolDateTime(weekStartKey);
  const weekEnd = poolDateTime(addDaysToDateKey(weekStartKey, 7));

  let initialEvents: any[] = [];
  try {
    initialEvents = await getEvents(weekStart, weekEnd);
  } catch (e) {
    console.error("Error fetching initial events:", e);
  }

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
        initialWeekStart={weekStartKey}
      />

      <PoolInfo />
    </div>
  );
}
