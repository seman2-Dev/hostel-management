import type { Metadata, Viewport } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/noto-sans-bengali/bengali-400.css";
import "@fontsource/noto-sans-bengali/bengali-500.css";
import "@fontsource/noto-sans-bengali/bengali-600.css";
import "@fontsource/noto-sans-bengali/bengali-700.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SkipLink } from "@/components/layout/skip-link";

export const metadata: Metadata = {
  title: "Shahid Monayem Chhatrabas · শহীদ মোনায়েম ছাত্রাবাস",
  description: "Smart hostel and meal management — 3D hostel view, daily menu, market expenses and announcements.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      {/* Some browser extensions (e.g. Grammarly) inject attributes into <body>
          before React hydrates. Suppress that harmless attribute mismatch. */}
      <body className="min-h-screen bg-brand-mesh" suppressHydrationWarning>
        <Providers>
          <SkipLink />
          <SiteHeader />
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
