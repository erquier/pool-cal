export default function PoolInfo() {
  const calendarUrl = `https://calendar.google.com/calendar/u/0?cid=${process.env.GOOGLE_CALENDAR_ID!}`;
  const icsUrl = "https://pool.erqlabs.site/api/events?format=ics";
  const webcalUrl = `webcal://pool.erqlabs.site/api/events?format=ics`;

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-sm mb-3 text-gray-800">
          ⏰ Horario de la piscina
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-xs">🕐</span>
            <span><strong>7:00 AM</strong> en adelante</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-xs">❌</span>
            <span>Cancela si no vas a usar el turno</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-xs">🏠</span>
            <span>Máximo 1 reserva por hogar al día</span>
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-sm mb-3 text-gray-800">
          📅 Ver reservas en tu calendario
        </h3>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          Agrega el calendario a tu app favorita y ve las reservas en tiempo real sin entrar a la página.
        </p>
        <div className="space-y-2">
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors group"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="group-hover:underline">Google Calendar</span>
          </a>

          <a
            href={webcalUrl}
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors group"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="group-hover:underline">Apple Calendar / iCal</span>
          </a>
        </div>
        <p className="text-[10px] text-gray-400 mt-2">
          En iPhone: toca el link de arriba → "Suscribirse" → se sincroniza solo.
        </p>
      </div>
    </div>
  );
}
