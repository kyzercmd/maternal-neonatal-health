import * as React from "react";

/**
 * useReveal — attach to an element to fade/slide in on scroll.
 * Respects prefers-reduced-motion (via CSS).
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = React.useRef<T | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement> & { as?: any; delay?: number }) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag
      ref={ref as any}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...(rest.style ?? {}) }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
