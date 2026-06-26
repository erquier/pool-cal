import type { Metadata } from "next";
import { SessionProvider } from "./SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pool-Cal — Reserva la Piscina",
  description: "Reserva la piscina del residencial por día y hora",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-b from-sky-100 to-white">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
