import type { Metadata } from "next";
import { DM_Mono, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui"
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-mono-ui"
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "Klaritex",
  description: "Klaritex scaffold",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }]
  },
  manifest: "/site.webmanifest"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable} ${dmMono.variable} ${playfairDisplay.variable}`}>{children}</body>
    </html>
  );
}
