// Lightweight unDraw-style inline SVG illustrations. Use currentColor + accent for theming.
import * as React from "react";

type Props = { className?: string };

export function IllustrationCare({ className }: Props) {
  return (
    <svg
      viewBox="0 0 480 320"
      className={className}
      role="img"
      aria-label="A nurse caring for a mother"
    >
      <defs>
        <linearGradient id="ic-bg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.93 0.05 230)" />
          <stop offset="100%" stopColor="oklch(0.97 0.02 220)" />
        </linearGradient>
      </defs>
      <rect width="480" height="320" rx="16" fill="url(#ic-bg)" />
      {/* Floor blob */}
      <ellipse cx="240" cy="280" rx="180" ry="14" fill="oklch(0.7 0.11 170 / 0.25)" />
      {/* Plant */}
      <rect x="60" y="200" width="40" height="48" rx="4" fill="oklch(0.78 0.13 75)" />
      <path
        d="M80 200 C70 170, 50 150, 70 130 C90 150, 95 180, 80 200Z"
        fill="oklch(0.55 0.13 165)"
      />
      <path
        d="M80 200 C90 170, 110 160, 100 130 C80 140, 75 170, 80 200Z"
        fill="oklch(0.62 0.12 170)"
      />
      {/* Mother (sitting) */}
      <circle cx="220" cy="140" r="26" fill="oklch(0.82 0.07 50)" />
      <path d="M198 138 q22 -28 44 0 q-4 -28 -22 -30 q-18 2 -22 30Z" fill="oklch(0.32 0.05 40)" />
      <rect x="194" y="162" width="62" height="80" rx="20" fill="oklch(0.58 0.13 235)" />
      <rect x="186" y="240" width="78" height="34" rx="10" fill="oklch(0.4 0.06 250)" />
      {/* Baby in arms */}
      <ellipse cx="240" cy="200" rx="22" ry="14" fill="oklch(0.95 0.05 60)" />
      <circle cx="258" cy="198" r="10" fill="oklch(0.86 0.08 50)" />
      {/* Nurse */}
      <circle cx="340" cy="130" r="24" fill="oklch(0.84 0.07 50)" />
      <rect x="328" y="110" width="24" height="14" rx="3" fill="oklch(0.98 0.01 230)" />
      <path d="M338 116 v8 M334 120 h8" stroke="oklch(0.58 0.13 235)" strokeWidth="2" />
      <rect x="316" y="152" width="48" height="78" rx="10" fill="oklch(0.98 0.01 230)" />
      <rect x="316" y="152" width="48" height="14" fill="oklch(0.7 0.11 170)" />
      <rect x="310" y="228" width="60" height="44" rx="8" fill="oklch(0.4 0.06 250)" />
      {/* Heart between them */}
      <path
        d="M280 140 a8 8 0 0 1 16 0 a8 8 0 0 1 16 0 q0 12 -16 24 q-16 -12 -16 -24Z"
        fill="oklch(0.66 0.14 20)"
      />
    </svg>
  );
}

export function IllustrationChat({ className }: Props) {
  return (
    <svg
      viewBox="0 0 480 320"
      className={className}
      role="img"
      aria-label="A friendly chat assistant"
    >
      <rect width="480" height="320" rx="16" fill="oklch(0.95 0.025 220)" />
      <ellipse cx="240" cy="280" rx="170" ry="12" fill="oklch(0.58 0.13 235 / 0.18)" />
      {/* Phone */}
      <rect x="170" y="60" width="140" height="220" rx="20" fill="oklch(0.4 0.06 250)" />
      <rect x="180" y="80" width="120" height="180" rx="10" fill="oklch(0.98 0.01 230)" />
      <rect x="192" y="98" width="80" height="22" rx="11" fill="oklch(0.92 0.06 170)" />
      <rect x="192" y="130" width="100" height="22" rx="11" fill="oklch(0.58 0.13 235)" />
      <rect x="192" y="162" width="70" height="22" rx="11" fill="oklch(0.92 0.06 170)" />
      <rect x="192" y="194" width="90" height="22" rx="11" fill="oklch(0.58 0.13 235)" />
      {/* Sparkle */}
      <path
        d="M360 110 l6 14 l14 6 l-14 6 l-6 14 l-6 -14 l-14 -6 l14 -6Z"
        fill="oklch(0.78 0.13 75)"
      />
      <path
        d="M120 200 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4Z"
        fill="oklch(0.7 0.11 170)"
      />
    </svg>
  );
}

export function IllustrationDoctor({ className }: Props) {
  return (
    <svg viewBox="0 0 480 320" className={className} role="img" aria-label="Doctor with clipboard">
      <rect width="480" height="320" rx="16" fill="oklch(0.96 0.02 220)" />
      <circle cx="240" cy="160" r="120" fill="oklch(0.92 0.06 170 / 0.6)" />
      {/* Doctor body */}
      <circle cx="240" cy="120" r="32" fill="oklch(0.84 0.07 50)" />
      <rect x="222" y="92" width="36" height="18" rx="4" fill="oklch(0.32 0.05 250)" />
      <rect x="200" y="148" width="80" height="100" rx="14" fill="oklch(0.98 0.01 230)" />
      <rect x="200" y="148" width="80" height="14" fill="oklch(0.58 0.13 235)" />
      <rect x="190" y="246" width="100" height="38" rx="8" fill="oklch(0.4 0.06 250)" />
      {/* Stethoscope */}
      <path d="M220 162 q-20 30 -10 60" stroke="oklch(0.32 0.05 240)" strokeWidth="3" fill="none" />
      <circle cx="216" cy="226" r="6" fill="oklch(0.32 0.05 240)" />
      {/* Clipboard */}
      <rect x="290" y="170" width="48" height="60" rx="4" fill="oklch(0.78 0.13 75)" />
      <rect x="296" y="178" width="36" height="4" fill="oklch(0.98 0.01 230)" />
      <rect x="296" y="190" width="28" height="3" fill="oklch(0.98 0.01 230)" />
      <rect x="296" y="200" width="32" height="3" fill="oklch(0.98 0.01 230)" />
    </svg>
  );
}

export function IllustrationCelebrate({ className }: Props) {
  return (
    <svg viewBox="0 0 320 240" className={className} role="img" aria-label="Celebration">
      <circle cx="160" cy="120" r="100" fill="oklch(0.92 0.06 170 / 0.55)" />
      <circle cx="160" cy="100" r="40" fill="oklch(0.84 0.07 50)" />
      <path d="M132 100 q28 -36 56 0 q-6 -34 -28 -36 q-22 2 -28 36Z" fill="oklch(0.32 0.05 40)" />
      <rect x="130" y="138" width="60" height="64" rx="14" fill="oklch(0.58 0.13 235)" />
      <path
        d="M70 70 l6 12 l12 6 l-12 6 l-6 12 l-6 -12 l-12 -6 l12 -6Z"
        fill="oklch(0.78 0.13 75)"
      />
      <path
        d="M240 60 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4Z"
        fill="oklch(0.66 0.14 20)"
      />
      <path
        d="M250 170 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4Z"
        fill="oklch(0.7 0.11 170)"
      />
    </svg>
  );
}
