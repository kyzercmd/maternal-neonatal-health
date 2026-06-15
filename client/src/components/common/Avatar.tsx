import * as React from "react";
import { User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Soft, colourful initial avatar — falls back to a generic person icon
 * when no image and no real name is supplied.
 */
export function Avatar({
  name,
  hue = 12,
  size = 40,
  src,
  className,
}: {
  name: string;
  hue?: number;
  size?: number;
  src?: string;
  className?: string;
}) {
  const trimmed = (name ?? "").trim();
  const generic = !trimmed || ["you", "welcome", "guest"].includes(trimmed.toLowerCase());

  const initials = React.useMemo(() => {
    const parts = trimmed.split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  }, [trimmed]);

  if (src) {
    return (
      <img
        src={src}
        alt={trimmed || "Profile"}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={cn("rounded-full object-cover border border-border", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (generic) {
    return (
      <div
        className={cn("rounded-full grid place-items-center bg-secondary text-muted-foreground border border-border shrink-0", className)}
        style={{ width: size, height: size }}
        aria-label="Default profile"
      >
        <UserIcon style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={1.6} />
      </div>
    );
  }

  return (
    <div
      className={cn("rounded-full grid place-items-center font-medium text-white shrink-0", className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${hue} 70% 70%), hsl(${(hue + 40) % 360} 70% 60%))`,
        fontSize: size * 0.4,
      }}
      aria-label={trimmed}
    >
      {initials}
    </div>
  );
}

