"use client";

import * as React from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { readImageFile } from "@/lib/files";
import { useI18n } from "@/i18n";

/** Validated image picker (JPG/PNG/WebP, max 2 MB). Phase 1 keeps the image as a data URL. */
export function ImageUpload({
  value,
  onChange,
  uploadLabel,
  removeLabel,
  id,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  uploadLabel: string;
  removeLabel: string;
  id: string;
}) {
  const { t } = useI18n();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const result = await readImageFile(file);
    if (result.ok) onChange(result.dataUrl);
    else toast.error(t(result.error));
  };

  return (
    <div className="flex items-center gap-3">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="size-14 rounded-lg border object-cover" />
      )}
      <input ref={inputRef} id={id} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onFile} />
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        <ImagePlus />
        {uploadLabel}
      </Button>
      {value && (
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
          <Trash2 />
          {removeLabel}
        </Button>
      )}
    </div>
  );
}
