import * as React from "react";
import { cn } from "@/lib/utils";

const fieldClass =
  "flex w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input type={type} className={cn(fieldClass, "h-10", className)} ref={ref} {...props} />
  ),
);
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea className={cn(fieldClass, "min-h-[84px] py-2", className)} ref={ref} {...props} />
  ),
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
