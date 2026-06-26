"use client";

import { useState } from "react";

interface Props {
  start: Date;
  end: Date;
  userName: string;
  onConfirm: (start: Date, end: Date) => Promise<void>;
  onClose: () => void;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatTime(d: Date): string {
  const h = d.getHours();
  const ampm = h >= 12 ? "p. m." : "a. m.";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${d.getMinutes().toString().padStart(2, "0")} ${ampm}`;
}

type Mode = "30min" | "1h" | "2h" | "custom";

export default function BookingModal({ start, end: _end, userName, onConfirm, onClose }: Props) {
  const startHour = start.getHours();
  const [mode, setMode] = useState<Mode>("1h");
  const [customEnd, setCustomEnd] = useState(startHour + 3);

  let actualEnd: Date;
  if (mode === "30min") {
    actualEnd = new Date(start.getTime() + 30 * 60 * 1000);
  } else if (mode === "1h") {
    actualEnd = new Date(start);
    actualEnd.setHours(startHour + 1, 0, 0, 0);
  } else if (mode === "2h") {
    actualEnd = new Date(start);
    actualEnd.setHours(startHour + 2, 0, 0, 0);
  } else {
    actualEnd = new Date(start);
    actualEnd.setHours(customEnd, 0, 0, 0);
  }

  const dayName = `${start.getDate()} de ${MONTHS[start.getMonth()]}`;

  // Opciones de hora de fin para custom: desde start+30min hasta 23:00
  const customOptions: number[] = [];
  const minCustom = startHour + 1;
  const maxCustom = 23;
  for (let h = minCustom; h <= maxCustom; h++) {
    customOptions.push(h);
  }

  // Si la custom end está fuera de rango, resetear
  if (customEnd > maxCustom || customEnd < minCustom) {
    setCustomEnd(minCustom);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-slide-up">
        <h2 className="text-lg font-bold mb-4">Nueva reserva</h2>

        <div className="bg-blue-50 rounded-xl p-3 mb-4">
          <p className="text-sm">
            <span className="font-medium">{dayName}</span>
          </p>
          <p className="text-sm text-gray-800 font-semibold">
            {formatTime(start)} — {formatTime(actualEnd)}
          </p>
          <p className="text-sm text-gray-500 mt-1">👤 {userName}</p>
        </div>

        <label className="text-sm font-medium text-gray-600 mb-2 block">
          Duración
        </label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {([
            { key: "30min" as Mode, label: "30 min" },
            { key: "1h" as Mode, label: "1 hora" },
            { key: "2h" as Mode, label: "2 horas" },
            { key: "custom" as Mode, label: "Personalizado" },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`py-2.5 px-2 rounded-xl text-sm font-medium border transition ${
                mode === key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "custom" && (
          <>
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Hasta las:
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {customOptions.map((h) => (
                <button
                  key={h}
                  onClick={() => setCustomEnd(h)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition ${
                    customEnd === h
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {formatTime(new Date(new Date().setHours(h, 0, 0, 0)))}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="text-xs text-gray-400 mb-4 text-center">
          {(actualEnd.getTime() - start.getTime()) / (1000 * 60)} min de reserva · Hasta las 10:00 p. m.
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              if (typeof window !== "undefined") {
                const btn = document.activeElement as HTMLButtonElement;
                btn.disabled = true;
                btn.textContent = "Reservando...";
              }
              await onConfirm(start, actualEnd);
            }}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Confirmar reserva
          </button>
        </div>
      </div>
    </div>
  );
}
