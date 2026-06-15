import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { Reveal } from "@/components/common/Reveal";
import {
  MapPin,
  ChevronLeft,
  Phone,
  Star,
  Stethoscope,
  Clock,
  ShieldCheck,
  Search,
  Navigation,
  Info,
  Users,
  ExternalLink,
  MessageCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/medical/clinics")({
  component: ClinicsPage,
});

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  availability: string;
  rating: number;
  reviews: number;
  verified: boolean;
  bio: string;
  patientReviews: { author: string; text: string; rating: number; date: string }[];
};

type Clinic = {
  id: string;
  name: string;
  type: "সরকারি" | "বেসরকারি" | "এনজিও";
  address: string;
  upazila: string;
  district: string;
  phone: string;
  rating: number;
  reviews: number;
  x: number; // percentage from left
  y: number; // percentage from top
  doctors: Doctor[];
  openNow: boolean;
};

const MOCK_CLINICS: Clinic[] = [
  {
    id: "c1",
    name: "বেলকুচি মা ও শিশু হাসপাতাল",
    type: "সরকারি",
    address: "বেলকুচি মেইন রোড, সিরাজগঞ্জ",
    upazila: "বেলকুচি",
    district: "সিরাজগঞ্জ",
    phone: "+880 1711-000111",
    rating: 4.8,
    reviews: 156,
    x: 48,
    y: 38, // Near main intersection
    openNow: true,
    doctors: [
      {
        id: "d1",
        name: "ডাঃ রেহানা বেগম",
        specialty: "স্ত্রী রোগ ও প্রসূতি বিশেষজ্ঞ",
        experience: "১২ বছর",
        availability: "সোম-শুক্র, সকাল ৯টা - বিকাল ৪টা",
        rating: 4.9,
        reviews: 85,
        verified: true,
        bio: "ডাঃ রেহানা বেগম একজন অভিজ্ঞ স্ত্রী রোগ বিশেষজ্ঞ। তিনি দীর্ঘ ১২ বছর ধরে মা ও শিশুদের সেবায় নিয়োজিত আছেন।",
        patientReviews: [
          {
            author: "ফাতেমা বেগম",
            text: "ডাক্তার অনেক ভালো এবং অমায়িক। সবকিছু খুব সুন্দর করে বুঝিয়ে বলেন।",
            rating: 5,
            date: "২ সপ্তাহ আগে",
          },
          {
            author: "সুমি আক্তার",
            text: "উনার চিকিৎসায় আমি অনেক সন্তুষ্ট।",
            rating: 5,
            date: "১ মাস আগে",
          },
        ],
      },
      {
        id: "d2",
        name: "ডাঃ আনিসুর রহমান",
        specialty: "শিশু বিশেষজ্ঞ",
        experience: "৮ বছর",
        availability: "শনি-বৃহস্পতি, সকাল ১০টা - বিকাল ৫টা",
        rating: 4.7,
        reviews: 42,
        verified: true,
        bio: "শিশুদের সাধারণ রোগ এবং টিকাদানে ডাঃ আনিসুর রহমান অত্যন্ত দক্ষ।",
        patientReviews: [
          {
            author: "করিম হোসেন",
            text: "আমার ছেলের জ্বরের সময় উনি খুব ভালো চিকিৎসা দিয়েছেন।",
            rating: 4,
            date: "৩ সপ্তাহ আগে",
          },
        ],
      },
    ],
  },
  {
    id: "c2",
    name: "ব্র্যাক মেটারনিটি সেন্টার",
    type: "এনজিও",
    address: "সোহাগপুর বাজার, বেলকুচি",
    upazila: "বেলকুচি",
    district: "সিরাজগঞ্জ",
    phone: "+880 1722-111222",
    rating: 4.6,
    reviews: 94,
    x: 38,
    y: 75, // Near vertical road
    openNow: true,
    doctors: [
      {
        id: "d3",
        name: "ডাঃ নুসরাত জাহান",
        specialty: "মিডওয়াইফারি প্রধান",
        experience: "১৫ বছর",
        availability: "২৪/৭ (পর্যায়ক্রমে)",
        rating: 4.8,
        reviews: 112,
        verified: true,
        bio: "প্রসবকালীন সেবায় ব্র্যাকের এই কেন্দ্রে ডাঃ নুসরাত বিশেষ ভূমিকা পালন করেন।",
        patientReviews: [
          {
            author: "রোকেয়া খাতুন",
            text: "খুবই যত্নশীল এবং দক্ষ মিডওয়াইফ দল।",
            rating: 5,
            date: "৫ দিন আগে",
          },
        ],
      },
    ],
  },
  {
    id: "c3",
    name: "গ্রিন ভিউ প্রাইভেট ক্লিনিক",
    type: "বেসরকারি",
    address: "তামাই বাজার রোড, বেলকুচি",
    upazila: "বেলকুচি",
    district: "সিরাজগঞ্জ",
    phone: "+880 1733-222333",
    rating: 4.2,
    reviews: 67,
    x: 20,
    y: 65, // Near lower horizontal road
    openNow: false,
    doctors: [
      {
        id: "d4",
        name: "ডাঃ ফারহানা ইয়াসমিন",
        specialty: "গাইনী বিশেষজ্ঞ",
        experience: "১০ বছর",
        availability: "বিকাল ৫টা - রাত ৯টা",
        rating: 4.5,
        reviews: 30,
        verified: false,
        bio: "ডাঃ ফারহানা প্রাইভেট চেম্বারে নিয়মিত রোগীদের পরামর্শ প্রদান করেন।",
        patientReviews: [
          {
            author: "মরিয়ম",
            text: "একটু ভিড় থাকে তবে ডাক্তার ভালো।",
            rating: 4,
            date: "২ মাস আগে",
          },
        ],
      },
    ],
  },
  {
    id: "c4",
    name: "উপজেলা স্বাস্থ্য কমপ্লেক্স",
    type: "সরকারি",
    address: "বেলকুচি সদর, সিরাজগঞ্জ",
    upazila: "বেলকুচি",
    district: "সিরাজগঞ্জ",
    phone: "+880 1744-333444",
    rating: 4.0,
    reviews: 210,
    x: 80,
    y: 32, // Near top horizontal road
    openNow: true,
    doctors: [
      {
        id: "d5",
        name: "ডাঃ কামাল হোসেন",
        specialty: "মেডিকেল অফিসার",
        experience: "৫ বছর",
        availability: "জরুরি ২৪/৭",
        rating: 4.1,
        reviews: 65,
        verified: true,
        bio: "সরকারি হাসপাতালের জরুরি বিভাগে নিয়োজিত দক্ষ চিকিৎসক।",
        patientReviews: [
          {
            author: "আব্দুল আলী",
            text: "জরুরি অবস্থায় উনারা দ্রুত ব্যবস্থা নেন।",
            rating: 4,
            date: "১ সপ্তাহ আগে",
          },
        ],
      },
    ],
  },
];

function ClinicsPage() {
  const { user } = useAuth();
  const [selectedClinic, setSelectedClinic] = React.useState<Clinic | null>(null);
  const [selectedDoctor, setSelectedDoctor] = React.useState<Doctor | null>(null);

  const locUpazila = "বেলকুচি";
  const locDistrict = "সিরাজগঞ্জ";

  return (
    <div className="space-y-6">
      {/* Header & Back Navigation */}
      <Reveal>
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <Link to="/medical">
              <ChevronLeft className="size-6" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl text-gradient-primary">
              ক্লিনিক ও ডাক্তার খুঁজুন
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium animate-pulse">
                <Navigation className="size-3" /> আপনার বর্তমান অবস্থান
              </div>
              <span>
                <span className="font-semibold text-foreground">{locUpazila}</span>, {locDistrict}
              </span>
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg h-9 bg-white/50 border-primary/20"
            >
              <Navigation className="size-3.5 mr-2" /> অবস্থান আপডেট করুন
            </Button>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-16rem)] min-h-[500px]">
        {/* Interactive 2D Map (Rural Google Maps Style) */}
        <div className="lg:col-span-8 relative rounded-2xl border border-border bg-[#f1f8e9] overflow-hidden group shadow-sm">
          {/* Map Base Layer (Lighter Green for Fields) */}
          <div className="absolute inset-0 bg-[#f1f8e9]" />

          {/* Mock Rural Map Features */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Natural Solid River Flow (Jamuna River context) */}
            <svg
              className="absolute inset-0 size-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path d="M 85 0 Q 75 25 88 50 T 82 100 L 100 100 L 100 0 Z" fill="#aadaff" />
              {/* Secondary organic stream */}
              <path d="M 85 45 Q 60 55 55 100" stroke="#aadaff" strokeWidth="2" fill="none" />
            </svg>

            {/* Dense Greenery / Fields / Forests */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-[5%] left-[5%] w-64 h-64 bg-[#c8e6c9] rounded-full" />
              <div className="absolute top-[40%] left-[10%] w-80 h-48 bg-[#c8e6c9] rounded-[40%]" />
              <div className="absolute bottom-[10%] left-[20%] w-72 h-72 bg-[#c8e6c9] rounded-full" />
              <div className="absolute top-[20%] right-[30%] w-48 h-96 bg-[#c8e6c9] rounded-3xl rotate-12" />
            </div>

            {/* Scattered Rural Clusters (Few Buildings) */}
            <div className="absolute top-[35%] left-[45%] w-8 h-8 bg-[#e0e0e0] rounded-sm rotate-12" />
            <div className="absolute top-[72%] left-[36%] w-6 h-6 bg-[#e0e0e0] rounded-sm -rotate-6" />
            <div className="absolute bottom-[28%] left-[18%] w-5 h-5 bg-[#e0e0e0] rounded-sm rotate-12" />

            {/* Rural Roads (Winding, White) */}
            <svg
              className="absolute inset-0 size-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Main Village Road (Horizontal-ish) */}
              <path
                d="M 0 35 Q 30 30 50 40 T 100 35"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Vertical-ish connector */}
              <path
                d="M 40 0 Q 45 40 35 60 T 40 100"
                stroke="white"
                strokeWidth="1.2"
                fill="none"
              />
              {/* Lower horizontal road */}
              <path d="M 0 70 Q 30 65 60 75 T 100 70" stroke="white" strokeWidth="1" fill="none" />
            </svg>
          </div>

          {/* Rural Texture Overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(#81c784 0.5px, transparent 0.5px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Current Location Marker (User) */}
          <div
            className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
            style={{ left: "38%", top: "33%" }} // Positioned near main intersection
          >
            <div className="relative">
              <div className="absolute inset-0 size-12 bg-primary/20 rounded-full animate-ping -translate-x-1/4 -translate-y-1/4" />
              <div className="size-6 rounded-full bg-white border-4 border-primary shadow-xl flex items-center justify-center relative z-10">
                <div className="size-2 rounded-full bg-primary" />
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                আপনি এখানে
              </div>
            </div>
          </div>

          {/* Clinic Markers */}
          {MOCK_CLINICS.map((clinic) => (
            <button
              key={clinic.id}
              onClick={() => setSelectedClinic(clinic)}
              className={cn(
                "absolute transition-all duration-300 hover:scale-125 z-10",
                selectedClinic?.id === clinic.id ? "scale-125 z-20" : "",
              )}
              style={{ left: `${clinic.x}%`, top: `${clinic.y}%` }}
            >
              <div className="relative group/marker">
                <div
                  className={cn(
                    "size-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-colors",
                    clinic.type === "সরকারি"
                      ? "bg-red-500"
                      : clinic.type === "এনজিও"
                        ? "bg-teal"
                        : "bg-sky-500",
                    selectedClinic?.id === clinic.id ? "ring-4 ring-primary/40" : "",
                  )}
                >
                  <MapPin className="size-4 text-white" />
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-foreground px-2 py-1 rounded text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity shadow-md border border-border pointer-events-none">
                  {clinic.name}
                </div>
              </div>
            </button>
          ))}

          <div className="absolute top-4 right-4 p-3 rounded-xl bg-white/90 backdrop-blur border border-border shadow-sm max-w-[200px]">
            <p className="text-[10px] uppercase tracking-wider font-bold text-primary/90 mb-1 flex items-center gap-1">
              <Info className="size-3" /> এলাকার তথ্য
            </p>
            <p className="text-xs leading-snug">
              আপনার ৫ কিমি এর মধ্যে <span className="text-primary font-bold">৪টি ভেরিফাইড</span>{" "}
              ক্লিনিক রয়েছে।
            </p>
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          {!selectedClinic ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-border bg-white/50">
              <div className="size-16 rounded-full bg-gradient-soft text-primary grid place-items-center mb-4">
                <Search className="size-8" />
              </div>
              <h3 className="font-display text-lg">ম্যাপ থেকে একটি ক্লিনিক নির্বাচন করুন</h3>
              <p className="text-sm text-muted-foreground mt-2">
                ডাক্তার, রিভিউ এবং যোগাযোগের তথ্যের জন্য যেকোনো মার্কারে ক্লিক করুন।
              </p>
            </div>
          ) : (
            <Reveal key={selectedClinic.id}>
              <div className="space-y-4 pb-4">
                {/* Clinic Info Card */}
                <div className="glass-card overflow-hidden">
                  <div className="h-24 bg-gradient-primary relative">
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/20 backdrop-blur text-white border-none">
                        {selectedClinic.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5 -mt-8 relative z-10">
                    <div className="size-14 rounded-2xl bg-white shadow-md border border-border flex items-center justify-center mb-3">
                      <MapPin className="size-7 text-primary" />
                    </div>
                    <h2 className="font-display text-xl leading-snug">{selectedClinic.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Navigation className="size-3.5" /> {selectedClinic.address}
                    </p>

                    <div className="flex items-center gap-4 mt-4 py-3 border-y border-border/50">
                      <div className="text-center flex-1">
                        <p className="text-[10px] uppercase text-muted-foreground">রেটিং</p>
                        <div className="flex items-center justify-center gap-1 text-sm font-bold">
                          <Star className="size-3.5 text-marigold fill-marigold" />{" "}
                          {selectedClinic.rating}
                        </div>
                      </div>
                      <div className="w-px h-8 bg-border/50" />
                      <div className="text-center flex-1">
                        <p className="text-[10px] uppercase text-muted-foreground">রিভিউ</p>
                        <p className="text-sm font-bold">{selectedClinic.reviews}</p>
                      </div>
                      <div className="w-px h-8 bg-border/50" />
                      <div className="text-center flex-1">
                        <p className="text-[10px] uppercase text-muted-foreground">অবস্থা</p>
                        <p
                          className={cn(
                            "text-sm font-bold",
                            selectedClinic.openNow ? "text-sage" : "text-destructive",
                          )}
                        >
                          {selectedClinic.openNow ? "খোলা" : "বন্ধ"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button className="rounded-xl bg-gradient-primary">
                        <Phone className="size-4 mr-2" /> কল করুন
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl border-primary/20 text-primary"
                      >
                        <MessageCircle className="size-4 mr-2" /> মেসেজ
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Doctors List */}
                <div className="space-y-3">
                  <h3 className="font-display text-lg px-1 flex items-center gap-2">
                    <Stethoscope className="size-5 text-primary" /> ভেরিফাইড ডাক্তারগণ
                  </h3>
                  {selectedClinic.doctors.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc)}
                      className="w-full text-left rounded-xl border border-border bg-white p-4 hover:border-primary/30 transition group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="size-12 rounded-lg bg-lavender/10 text-lavender grid place-items-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition">
                          <Users className="size-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm truncate">{doc.name}</h4>
                            {doc.verified && <ShieldCheck className="size-3.5 text-teal" />}
                          </div>
                          <p className="text-xs text-primary font-medium">
                            {doc.specialty} • {doc.experience}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="size-3" /> {doc.availability}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-marigold font-bold">
                              <Star className="size-3 fill-marigold" /> {doc.rating}
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary transition" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* Doctor Details Modal */}
      <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-gradient-primary text-white grid place-items-center">
                <Users className="size-8" />
              </div>
              <div>
                <DialogTitle className="font-display text-xl flex items-center gap-2">
                  {selectedDoctor?.name}
                  {selectedDoctor?.verified && <ShieldCheck className="size-5 text-teal" />}
                </DialogTitle>
                <DialogDescription className="text-primary font-medium">
                  {selectedDoctor?.specialty} • {selectedDoctor?.experience}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Info className="size-4 text-primary" /> ডাক্তার সম্পর্কে
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedDoctor?.bio}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">রেটিং</p>
                <div className="flex items-center gap-1.5 font-bold">
                  <Star className="size-4 text-marigold fill-marigold" /> {selectedDoctor?.rating}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">রিভিউ</p>
                <div className="flex items-center gap-1.5 font-bold">
                  <MessageCircle className="size-4 text-primary" /> {selectedDoctor?.reviews}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Star className="size-4 text-primary" /> মায়েদের মতামত
              </h4>
              <div className="space-y-3">
                {selectedDoctor?.patientReviews.map((rev, i) => (
                  <div key={i} className="p-3 rounded-xl border border-border bg-white/50 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{rev.author}</span>
                      <span className="text-[10px] text-muted-foreground">{rev.date}</span>
                    </div>
                    <p className="text-muted-foreground italic leading-relaxed">"{rev.text}"</p>
                    <div className="flex gap-0.5 mt-2 text-marigold">
                      {Array.from({ length: rev.rating }).map((_, j) => (
                        <Star key={j} className="size-3 fill-current" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full rounded-xl bg-gradient-primary">
              অ্যাপয়েন্টমেন্ট বুক করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
