"use client";

import * as React from "react";
import { ErrorState } from "@/components/ui/states";

/** Route-level error boundary — shown if any page throws while rendering. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container py-16">
      <ErrorState onRetry={reset} />
    </div>
  );
}
