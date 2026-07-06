import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
    default: "PG Finder - Find Paying Guest Accommodations in India",
    template: "%s | PG Finder",
  },
  description:
    "Search for PGs, hostels, and dormitories across India. Filter by city, area, rent, amenities, and gender. Find your perfect PG near you.",
  keywords: [
    "PG",
    "paying guest",
    "hostel",
    "boys PG",
    "girls PG",
    "unisex PG",
    "accommodation",
    "India",
    "Hyderabad PG",
    "Bengaluru PG",
    "Mumbai PG",
  ],
  openGraph: {
    title: "PG Finder - Find Paying Guest Accommodations in India",
    description:
      "Search for PGs, hostels, and dormitories across India. Find your perfect home near you.",
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
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
