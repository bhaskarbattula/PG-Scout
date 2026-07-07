import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatAssistant } from "@/components/ChatAssistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PG Finder - Find PGs Near Your Workplace in India",
    template: "%s | PG Finder",
  },
  description:
    "Search for PGs and hostels near your workplace. Find accommodations near Amazon, Google, Microsoft, Infosys, TCS offices across India.",
  keywords: [
    "PG", "paying guest", "hostel", "workplace PG", "company accommodation",
    "Amazon PG", "Google PG", "Infosys PG", "TCS PG", "Microsoft PG",
    "Bangalore PG", "Hyderabad PG", "India accommodation",
  ],
  openGraph: {
    title: "PG Finder - Find PGs Near Your Workplace",
    description: "Search for PGs and hostels near your office in India.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <ThemeProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatAssistant />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
