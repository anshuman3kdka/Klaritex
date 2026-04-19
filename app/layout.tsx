import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

const title = "Klaritex — Language Exposed. Accountability Scored.";
const description =
  "Klaritex lets you submit language samples, review accountability scores, and explore clear reports that help you understand communication risks and patterns.";
const socialImage = "/og-image.png";

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title,
  description,
  alternates: {
    canonical: siteUrl || undefined
  },
  openGraph: {
    title,
    description,
    url: siteUrl || undefined,
    images: [
      {
        url: socialImage,
        alt: "Klaritex social preview image"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage]
  },
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
      <body>{children}</body>
    </html>
  );
}
