"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LogoMark } from "@/components/layout/logo";
import { I18nProvider } from "@/i18n";
import { HostelStoreProvider } from "@/store/hostel-store";
import { AuthProvider } from "@/store/auth";

/**
 * The Phase 1 mock store derives "today" from the visitor's clock, so the app renders on the client only.
 * This avoids server/client date mismatches. Phase 2 replaces the store with API data.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <I18nProvider>
        {mounted ? (
          <HostelStoreProvider>
            <AuthProvider>
              <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
            </AuthProvider>
          </HostelStoreProvider>
        ) : (
          <div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center">
            <div className="animate-pulse">
              <LogoMark />
            </div>
          </div>
        )}
        <Toaster richColors closeButton position="bottom-right" />
      </I18nProvider>
    </ThemeProvider>
  );
}
