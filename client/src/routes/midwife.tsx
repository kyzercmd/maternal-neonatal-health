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
  head: () => ({ meta: [{ title: "ডিজিটাল মিডওয়াইফ — মমতা" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : undefined,
    send: s.send === 1 || s.send === "1" ? 1 : undefined,
  }),
  component: () => (
    <AppShell>
      <RequireTier level={3}>
        <Midwife />
      </RequireTier>
    </AppShell>
  ),
});

const EMERGENCY_KEYWORDS = [
  "jaundice",
  "fever",
  "bleeding",
  "suicidal",
  "unconscious",
  "seizure",
  "blood",
  "emergency",
  "জ্বর",
  "রক্তপাত",
  "রক্ত",
  "জন্ডিস",
  "অজ্ঞান",
  "জরুরি",
  "খিঁচুনি",
];

import { chatbot } from "@/services/api";

function Midwife() {
  const { user } = useAuth();
  const { q, send: sendFlag } = Route.useSearch();
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "m0",
      role: "assistant",
      text: `হ্যালো 🌷 আমি আপনার ডিজিটাল মিডওয়াইফ। দৈনন্দিন নানা প্রশ্নের সঠিক এবং যাচাইকৃত তথ্য দিয়ে আমি আপনাকে সাহায্য করতে পারি। তবে আমি কোনো রোগ নির্ণয় বা ওষুধের নাম দিতে পারি না — যেকোনো বড় স্বাস্থ্যগত সিদ্ধান্তের জন্য অবশ্যই একজন চিকিৎসকের পরামর্শ নিন।`,
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);
  const didPrefill = React.useRef(false);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  React.useEffect(() => {
    if (q && !didPrefill.current) {
      didPrefill.current = true;
      if (sendFlag) send(q);
      else setInput(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sendFlag]);

  const send = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const isEmergency = EMERGENCY_KEYWORDS.some((k) => text.toLowerCase().includes(k));

      if (isEmergency) {
        const reply: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `আপনি যা বর্ণনা করছেন তা বেশ জরুরি মনে হচ্ছে। অনুগ্রহ করে এখনই একজন চিকিৎসকের শরণাপন্ন হন — নিচে আপনার কাছাকাছি একটি হাসপাতালের ঠিকানা দেওয়া হলো।`,
          emergency: {
            hospital: user.district
              ? `${user.district} জেলা হাসপাতাল`
              : "ঢাকা মেডিকেল কলেজ হাসপাতাল",
            address: `${user.upazila || "শহরের কেন্দ্র"}, ${user.district || "ঢাকা"}`,
            upazila: `${user.upazila || "উপজেলা"} হেলথ কমপ্লেক্স`,
            helpline: "16263",
          },
        };
        setMessages((m) => [...m, reply]);
      } else {
        const { response } = await chatbot.chat(text);
        const reply: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: response,
        };
        setMessages((m) => [...m, reply]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "দুঃখিত, আমি বর্তমানে সংযোগ করতে পারছি না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
      };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const voiceInput = () => {
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) {
      alert("আপনার ব্রাউজারে ভয়েস সাপোর্ট নেই।");
      return;
    }
    const r = new Ctor();
    r.lang = user.language === "bn" ? "bn-BD" : "en-US";
    r.onresult = (e: any) => setInput(e.results[0][0].transcript);
    r.start();
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-9rem)]">
      <header className="mb-3">
        <div className="flex items-center gap-2">
          <span className="size-9 rounded-xl bg-sage/15 text-sage grid place-items-center">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h1 className="font-display text-xl leading-none">ডিজিটাল মিডওয়াইফ</h1>
            <p className="text-[11px] text-muted-foreground">
              দৈনন্দিন ছোটখাটো প্রশ্নের সহজ সমাধান — তবে এটি কখনোই আপনার ডাক্তারের বিকল্প নয়।
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-white border border-border"}`}
            >
              <p className="whitespace-pre-line">{m.text}</p>
              {m.emergency && (
                <div className="mt-3 rounded-xl bg-destructive/10 border border-destructive/30 p-3 space-y-2 text-foreground">
                  <div className="flex items-center gap-1.5 text-destructive font-medium text-xs">
                    <AlertCircle className="size-3.5" /> এখনই জরুরি সাহায্য নিন
                  </div>
                  <p className="text-sm font-medium">{m.emergency.hospital}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3" />
                    {m.emergency.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    এছাড়াও দেখতে পারেন: {m.emergency.upazila}
                  </p>
                  <a
                    href={`tel:${m.emergency.helpline}`}
                    className="inline-flex items-center gap-1.5 text-xs bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full"
                  >
                    <Phone className="size-3" /> কল করুন {m.emergency.helpline}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-border rounded-2xl px-4 py-2.5">
              <div className="flex gap-1">
                <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-1 px-1">
          {seedSuggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => send(s.text)}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-accent transition"
            >
              {s.text}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-2 flex gap-2 items-end bg-white border border-border rounded-2xl p-2"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder="গর্ভাবস্থা, শিশুর যত্ন বা যেকোনো প্রশ্ন লিখুন..."
          className="border-0 focus-visible:ring-0 resize-none min-h-0 h-9"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={voiceInput}
          className="rounded-full"
        >
          <Mic className="size-4" />
        </Button>
        <Button type="submit" disabled={!input.trim()} className="rounded-full">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
