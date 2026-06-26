import { auth, signOut } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import CalendarClient from "./CalendarClient";
import PoolInfo from "./PoolInfo";

export default async function Home() {
  const session = await auth();
  if (!session) redirect("/login");

  const calendarUrl = `https://calendar.google.com/calendar/u/0?cid=${process.env.GOOGLE_CALENDAR_ID!}`;

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">🏊 Pool-Cal</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Residencial Ian 2</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            {session.user?.image && (
              <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
            )}
            <span className="text-sm font-medium">{session.user?.name}</span>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              type="submit"
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      <CalendarClient userEmail={session.user?.email || ""} userName={session.user?.name || ""} />

      <PoolInfo calendarUrl={calendarUrl} />
    </div>
  );
}
