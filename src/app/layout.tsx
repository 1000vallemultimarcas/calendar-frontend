import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import hero_img from "@/assets/hero.png";
import { AuthProvider } from "@/features/calendar/contexts/authContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TurboFlow Agenda",
  description:
    "Agenda TurboFlow para gestao de compromissos, com multiplas visualizacoes e controle de eventos.",
  keywords: [
    "calendar",
    "nextjs",
    "shadcn",
    "react",
    "typescript",
    "turboflow agenda",
  ],
  authors: [{ name: "Jeraidi Yassir", url: "https://jeraidi.tech" }],
  creator: "Jeraidi Yassir",
  applicationName: "TurboFlow Agenda",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
    shortcut: "/icon.png",
  },
  openGraph: {
    title: "TurboFlow Agenda",
    description: "Agenda TurboFlow para organizacao de compromissos.",
    url: "https://calendar.jeraidi.tech/",
    type: "website",
    siteName: "TurboFlow Agenda",
    images: [{ url: hero_img.src }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TurboFlow Agenda",
    description: "Agenda TurboFlow para organizacao de compromissos.",
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: "Next.js",
  metadataBase: new URL("https://calendar.jeraidi.tech/"),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>

          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
