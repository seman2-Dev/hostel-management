import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;
}

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function average(values: number[]): number {
  return values.length ? sum(values) / values.length : 0;
}
