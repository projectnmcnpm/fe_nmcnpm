import type { Metadata } from "next";
import {
  Space_Grotesk,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Footer from "@/components/layout/Footer";
import { ToastProvider } from "@/components/layout/ToastProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "GenZ Cinema Homestay",
  description: "Trải nghiệm lưu trú theo phong cách điện ảnh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable}`}
    >
      <body
        className="bg-bg-primary text-text-primary min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        <AuthProvider>
          <ToastProvider>
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
