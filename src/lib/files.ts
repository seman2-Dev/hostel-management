/** Browser-side file helpers (CSV export, image upload validation). */

const FORMULA_START = /^[=+\-@]/;

function csvCell(value: string | number): string {
  let s = String(value);
  // Neutralise spreadsheet formula injection in text cells.
  if (typeof value === "string" && FORMULA_START.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(filename: string, rows: Array<Array<string | number>>): void {
  // BOM makes Excel render Bangla text correctly.
  const csv = `﻿${rows.map((r) => r.map(csvCell).join(",")).join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ImageResult = { ok: true; dataUrl: string } | { ok: false; error: "validation.maxFile" | "validation.fileType" };

/** Validates type and size, then reads the image as a data URL (Phase 2 uploads to the server instead). */
export function readImageFile(file: File): Promise<ImageResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return Promise.resolve({ ok: false, error: "validation.fileType" });
  if (file.size > MAX_IMAGE_BYTES) return Promise.resolve({ ok: false, error: "validation.maxFile" });
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ ok: true, dataUrl: String(reader.result) });
    reader.onerror = () => resolve({ ok: false, error: "validation.fileType" });
    reader.readAsDataURL(file);
  });
}
