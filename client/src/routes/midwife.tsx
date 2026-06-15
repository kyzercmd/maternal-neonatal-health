import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RequireTier } from "@/components/layout/RequireTier";
import { seedSuggestions } from "@/lib/seed";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, AlertCircle, Phone, MapPin, Mic } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/midwife")({
  head: () => ({ meta: [{ title: "Digital Midwife — Momota" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : undefined,
    send: s.send === 1 || s.send === "1" ? 1 : undefined,
  }),
  component: () => (<AppShell><RequireTier level={3}><Midwife /></RequireTier></AppShell>),
});

const EMERGENCY_KEYWORDS = ["jaundice","fever","bleeding","suicidal","unconscious","seizure","blood","emergency"];

function Midwife() {
  const { user } = useAuth();
  const { q, send: sendFlag } = Route.useSearch();
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { id: "m0", role: "assistant", text: `Hello 🌷 I'm your Digital Midwife. I share verified information for everyday questions. I won't diagnose or prescribe — please always consult a doctor for medical decisions.` },
  ]);
  const [input, setInput] = React.useState("");
  const endRef = React.useRef<HTMLDivElement>(null);
  const didPrefill = React.useRef(false);

  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  React.useEffect(() => {
    if (q && !didPrefill.current) {
      didPrefill.current = true;
      if (sendFlag) send(q);
      else setInput(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sendFlag]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text };
    const isEmergency = EMERGENCY_KEYWORDS.some((k) => text.toLowerCase().includes(k));
    const reply: ChatMessage = isEmergency
      ? {
          id: crypto.randomUUID(), role: "assistant",
          text: `What you described sounds urgent. Please reach a clinician immediately — here's a verified facility near you.`,
          emergency: {
            hospital: user.district ? `${user.district} District Hospital` : "Dhaka Medical College Hospital",
            address: `${user.upazila || "City centre"}, ${user.district || "Dhaka"}`,
            upazila: `${user.upazila || "Upazila"} Health Complex`,
            helpline: "16263",
          },
        }
      : {
          id: crypto.randomUUID(), role: "assistant",
          text: `This is general guidance, not a diagnosis. For your stage, keep EPI vaccinations up to date and aim for balanced meals. If something feels off, please see a doctor.`,
        };
    setMessages((m) => [...m, userMsg, reply]);
    setInput("");
  };


  const voiceInput = () => {
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) { alert("Voice not supported on this browser."); return; }
    const r = new Ctor();
    r.lang = user.language === "bn" ? "bn-BD" : "en-US";
    r.onresult = (e: any) => setInput(e.results[0][0].transcript);
    r.start();
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-9rem)]">
      <header className="mb-3">
        <div className="flex items-center gap-2">
          <span className="size-9 rounded-xl bg-sage/15 text-sage grid place-items-center"><Sparkles className="size-4" /></span>
          <div>
            <h1 className="font-display text-xl leading-none">Digital Midwife</h1>
            <p className="text-[11px] text-muted-foreground">A gentle helper for everyday questions — not a replacement for your doctor.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-white border border-border"}`}>
              <p className="whitespace-pre-line">{m.text}</p>
              {m.emergency && (
                <div className="mt-3 rounded-xl bg-destructive/10 border border-destructive/30 p-3 space-y-2 text-foreground">
                  <div className="flex items-center gap-1.5 text-destructive font-medium text-xs"><AlertCircle className="size-3.5" /> Get help now</div>
                  <p className="text-sm font-medium">{m.emergency.hospital}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3" />{m.emergency.address}</p>
                  <p className="text-xs text-muted-foreground">Also try: {m.emergency.upazila}</p>
                  <a href={`tel:${m.emergency.helpline}`} className="inline-flex items-center gap-1.5 text-xs bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full">
                    <Phone className="size-3" /> Call {m.emergency.helpline}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-1 px-1">
          {seedSuggestions.map((s) => (
            <button key={s.id} onClick={() => send(s.text)} className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-accent transition">{s.text}</button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-2 flex gap-2 items-end bg-white border border-border rounded-2xl p-2">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={1} placeholder="Ask anything about pregnancy, baby care..." className="border-0 focus-visible:ring-0 resize-none min-h-0 h-9" />
        <Button type="button" variant="ghost" size="icon" onClick={voiceInput} className="rounded-full"><Mic className="size-4" /></Button>
        <Button type="submit" disabled={!input.trim()} className="rounded-full"><Send className="size-4" /></Button>
      </form>
    </div>
  );
}
