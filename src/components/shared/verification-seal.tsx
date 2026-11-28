import { cn } from "@/lib/utils";

/** Official-style seal used for the student-hostel verification panel. */
export function VerificationSeal({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative grid size-24 shrink-0 place-items-center rounded-full border-[3px] border-double border-brass/70 bg-gradient-to-br from-brass/15 to-primary/10 shadow-panel",
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-2 rounded-full border border-brass/40" />
      <div className="flex flex-col items-center leading-none text-primary">
        <svg viewBox="0 0 24 24" className="size-6 text-brass" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2 4 6v6c0 5 3.4 8.3 8 10 4.6-1.7 8-5 8-10V6l-8-4Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <span className="mt-1 text-[10px] font-bold tracking-widest">SM</span>
        <span className="mt-0.5 text-sm font-bold tracking-tight">1963</span>
      </div>
    </div>
  );
}
