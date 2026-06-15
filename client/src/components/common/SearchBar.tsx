import * as React from "react";
import { Mic, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SpeechRecognition = any;
declare global {
  interface Window { SpeechRecognition?: any; webkitSpeechRecognition?: any }
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: (v: string) => void;
  placeholder?: string;
  className?: string;
  lang?: string; // e.g. "bn-BD", "en-US"
};

export function SearchBar({ value, onChange, onSubmit, placeholder = "Search...", className, lang = "en-US" }: Props) {
  const [listening, setListening] = React.useState(false);
  const recRef = React.useRef<SpeechRecognition | null>(null);

  const startVoice = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      alert("Voice input isn't supported on this browser yet. Try Chrome on Android.");
      return;
    }
    const r = new Ctor();
    r.lang = lang;
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e: any) => {
      const txt = e.results[0][0].transcript;
      onChange(txt);
      onSubmit?.(txt);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
    recRef.current = r;
    setListening(true);
  }, [lang, onChange, onSubmit]);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit?.(value); }}
      className={cn(
        "flex items-center gap-2 bg-white border border-border rounded-full px-3 sm:px-4 h-11 sm:h-12 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 transition",
        className
      )}
      role="search"
    >
      <Search className="size-4 text-muted-foreground shrink-0" aria-hidden />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
        aria-label={placeholder}
      />
      {value && (
        <button type="button" onClick={() => onChange("")} className="text-muted-foreground hover:text-foreground p-1" aria-label="Clear">
          <X className="size-4" />
        </button>
      )}
      <button
        type="button"
        onClick={startVoice}
        className={cn(
          "shrink-0 rounded-full size-8 sm:size-9 grid place-items-center transition",
          listening ? "bg-primary text-primary-foreground animate-pulse" : "bg-secondary text-foreground hover:bg-accent"
        )}
        aria-label="Voice search"
        title="Voice search"
      >
        <Mic className="size-4" />
      </button>
    </form>
  );
}
