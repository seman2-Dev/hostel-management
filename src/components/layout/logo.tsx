import { cn } from "@/lib/utils";

/** Mark inspired by the hostel gate: a dark arch, red discs and green posts. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("size-9", className)} aria-hidden="true">
      <rect x="4" y="38" width="40" height="5" rx="2" fill="#b91c1c" />
      <rect x="9" y="20" width="3.5" height="19" fill="#15803d" />
      <rect x="35.5" y="20" width="3.5" height="19" fill="#15803d" />
      <path d="M8 22 C8 6 40 6 40 22 L35 22 C35 12 13 12 13 22 Z" fill="#1f2933" />
      <circle cx="15.5" cy="17" r="3.2" fill="#dc2626" />
      <circle cx="32.5" cy="17" r="3.2" fill="#dc2626" />
      <path d="M24 3 C27 6 27 9 24 11 C21 9 21 6 24 3 Z" fill="#16a34a" />
      <rect x="19" y="27" width="10" height="11" rx="1.5" fill="#f4b740" />
      <rect x="23.2" y="27" width="1.6" height="11" fill="#b91c1c" />
    </svg>
  );
}
