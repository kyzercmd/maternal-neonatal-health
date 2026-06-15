import * as React from "react";
import { ImagePlus, X, Film } from "lucide-react";
import { cn } from "@/lib/utils";

export type UploadedMedia = {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
};

type Props = {
  value: UploadedMedia[];
  onChange: (next: UploadedMedia[]) => void;
  max?: number;
  className?: string;
  compact?: boolean;
  label?: string;
  maxLabel?: string;
};

/**
 * MediaUploader — local preview only (object URLs).
 * Hook real upload by replacing `addFiles` with a service that returns
 * remote URLs from the backend.
 */
export function MediaUploader({ value, onChange, max = 6, className, compact, label, maxLabel }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const room = Math.max(0, max - value.length);
    const next: UploadedMedia[] = [];
    Array.from(files).slice(0, room).forEach((f) => {
      const isVid = f.type.startsWith("video/");
      next.push({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(f),
        type: isVid ? "video" : "image",
        name: f.name,
      });
    });
    onChange([...value, ...next]);
  };

  const remove = (id: string) => onChange(value.filter((m) => m.id !== id));

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-white/60 hover:bg-white transition text-sm text-muted-foreground",
          compact ? "h-10" : "h-24"
        )}
        disabled={value.length >= max}
      >
        <ImagePlus className="size-4" />
        {value.length >= max ? (maxLabel ?? `Up to ${max} files`) : (label ?? "Add photos or videos")}
      </button>

      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((m) => (
            <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
              {m.type === "image" ? (
                <img src={m.url} alt={m.name} loading="lazy" decoding="async" className="size-full object-cover" />
              ) : (
                <div className="size-full grid place-items-center bg-foreground/80 text-background">
                  <Film className="size-5" />
                  <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1 rounded">video</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(m.id)}
                className="absolute top-1 right-1 size-6 rounded-full bg-black/60 text-white grid place-items-center opacity-90 hover:opacity-100"
                aria-label="Remove"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
