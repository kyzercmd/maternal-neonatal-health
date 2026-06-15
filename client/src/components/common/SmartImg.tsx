import * as React from "react";

const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#f5e6df'/><stop offset='1' stop-color='#e9d5c8'/>
      </linearGradient></defs>
      <rect width='200' height='200' fill='url(#g)'/>
      <g fill='none' stroke='#b58a7a' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'>
        <rect x='40' y='55' width='120' height='90' rx='10'/>
        <circle cx='75' cy='90' r='10'/>
        <path d='M40 130 L80 100 L110 125 L135 105 L160 130'/>
      </g>
      <text x='100' y='175' font-family='system-ui' font-size='12' fill='#8a6b5e' text-anchor='middle'>Image unavailable</text>
    </svg>`,
  );

export function SmartImg({
  src,
  fallback = FALLBACK,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { fallback?: string }) {
  const initial = src && String(src).length > 0 ? src : fallback;
  const [current, setCurrent] = React.useState<string>(initial as string);
  React.useEffect(() => { setCurrent((src && String(src).length > 0 ? src : fallback) as string); }, [src, fallback]);
  return <img {...props} src={current} onError={() => setCurrent(fallback)} />;
}
