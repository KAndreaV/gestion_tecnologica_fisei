import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import "./styles/globals.css";
import "./styles/auth.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gestión Tecnológica FISEI",
  description: "Sistema web administrativo para gestión de laboratorios, equipos, usuarios y reportes tecnológicos de FISEI.",
  keywords: ["laboratorios", "FISEI", "gestión tecnológica", "inventario", "equipos"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={manrope.variable} suppressHydrationWarning>
      <body>
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
