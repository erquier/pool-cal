"use client";

import { useState } from "react";

interface Props {
  start: Date;
  end: Date;
  userName: string;
  onConfirm: (start: Date, end: Date) => Promise<void>;
  onClose: () => void;
}

const DURATIONS = [
  { label: "30 min", value: 0.5 },
  { label: "1 hora", value: 1 },
  { label: "2 horas", value: 2 },
  { label: "3 horas (máx)", value: 3 },
];

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatTime(d: Date): string {
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function BookingModal({ start, end, userName, onConfirm, onClose }: Props) {
  const [duration, setDuration] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const actualEnd = new Date(start);
  actualEnd.setHours(start.getHours() + duration);

  const dayName = `${start.getDate()} de ${MONTHS[start.getMonth()]}`;

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-slide-up">
        <h2 className="text-lg font-bold mb-4">Nueva reserva</h2>

        <div className="bg-blue-50 rounded-xl p-3 mb-4">
          <p className="text-sm">
            <span className="font-medium">{dayName}</span>
          </p>
          <p className="text-sm text-gray-600">
            {formatTime(start)} — {formatTime(actualEnd)}
          </p>
          <p className="text-sm text-gray-500 mt-1">👤 {userName}</p>
        </div>

        <label className="text-sm font-medium text-gray-600 mb-2 block">
          Duración
        </label>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              className={`py-2 px-3 rounded-xl text-sm font-medium border transition ${
                duration === d.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
              }`}
            >
              {d.label}
            </button>
          ))}
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
              setSubmitting(true);
              await onConfirm(start, actualEnd);
              setSubmitting(false);
            }}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Reservando..." : "Confirmar reserva"}
          </button>
        </div>
      </div>
    </div>
  );
}
