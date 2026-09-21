import type { Metadata } from "next";
import { headers } from "next/headers";
import CookieConsent from "./CookieConsent";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "Высота — натяжные потолки в Екатеринбурге";
  const description = "Натяжные потолки, бесплатный замер и монтаж под ключ в Екатеринбурге.";

  return {
    metadataBase: new URL(origin),
    title,
    description,
    icons: { icon: "/assets/logo-mark.png", shortcut: "/assets/logo-mark.png" },
    openGraph: { title, description, type: "website", url: origin, images: [{ url: `${origin}/og.png`, width: 1731, height: 909, alt: "Высота — натяжные потолки в Екатеринбурге" }] },
    twitter: { card: "summary_large_image", title, description, images: [`${origin}/og.png`] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}<CookieConsent /></body></html>;
}
