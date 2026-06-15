// Minimal i18n with reactive language toggle.
import * as React from "react";
import { useAuth } from "./auth";

const dict = {
  appTagline: { en: "Support for mothers in Bangladesh", bn: "বাংলাদেশের মায়েদের জন্য সহায়তা" },

  // Nav
  navCommunity: { en: "Community", bn: "কমিউনিটি" },
  navMarket: { en: "Market", bn: "মার্কেট" },
  navMarketplace: { en: "Marketplace", bn: "মার্কেটপ্লেস" },
  navMidwife: { en: "Midwife", bn: "মিডওয়াইফ" },
  navMedical: { en: "Medical", bn: "মেডিকেল" },
  navProfile: { en: "Profile", bn: "প্রোফাইল" },

  // Search / common
  search: { en: "Search", bn: "অনুসন্ধান" },
  searchCommunity: { en: "Search the community...", bn: "কমিউনিটি অনুসন্ধান করুন..." },
  searchMarket: {
    en: "Search items, brands, sellers...",
    bn: "পণ্য, ব্র্যান্ড, বিক্রেতা খুঁজুন...",
  },
  signIn: { en: "Sign in", bn: "সাইন ইন" },
  signOut: { en: "Sign out", bn: "সাইন আউট" },
  back: { en: "Back", bn: "ফিরে যান" },
  save: { en: "Save", bn: "সংরক্ষণ" },
  cancel: { en: "Cancel", bn: "বাতিল" },
  submit: { en: "Submit", bn: "জমা দিন" },
  change: { en: "Change", bn: "পরিবর্তন" },
  noResults: { en: "No items match your filters.", bn: "কোনো ফলাফল পাওয়া যায়নি।" },
  all: { en: "All", bn: "সব" },
  featured: { en: "Featured", bn: "ফিচারড" },

  // Feed
  postPlaceholder: {
    en: "Share something kind with your cohort...",
    bn: "আপনার কোহর্টের সাথে কিছু শেয়ার করুন...",
  },
  post: { en: "Post", bn: "পোস্ট" },
  comments: { en: "Comments", bn: "মন্তব্য" },
  writeComment: { en: "Write a comment...", bn: "একটি মন্তব্য লিখুন..." },
  yourCohort: { en: "Your cohort", bn: "আপনার কোহর্ট" },
  yourCohortBody: {
    en: "You see posts from mothers at the same stage.",
    bn: "আপনি একই পর্যায়ের মায়েদের পোস্ট দেখছেন।",
  },
  guidelines: { en: "Community guidelines", bn: "কমিউনিটি নির্দেশিকা" },
  guideline1: { en: "Be kind. We're all learning.", bn: "দয়ালু হোন। আমরা সবাই শিখছি।" },
  guideline2: {
    en: "No medical advice — only experiences.",
    bn: "চিকিৎসা পরামর্শ নয় — শুধু অভিজ্ঞতা।",
  },
  guideline3: { en: "Report anything unsafe.", bn: "অনিরাপদ কিছু থাকলে রিপোর্ট করুন।" },
  noPosts: {
    en: "No posts in this cohort yet — be the first to share 🌷",
    bn: "এই কোহর্টে এখনও কোনো পোস্ট নেই — প্রথম হয়ে শেয়ার করুন 🌷",
  },
  postingTo: { en: "Posting to", bn: "পোস্ট হচ্ছে" },
  cohortLabel: { en: "cohort", bn: "কোহর্টে" },
  reportPost: { en: "Report this post", bn: "এই পোস্ট রিপোর্ট করুন" },
  like: { en: "Like", bn: "লাইক" },
  noComments: {
    en: "No comments yet. Be gentle in your reply 🌷",
    bn: "এখনও কোনো মন্তব্য নেই। সদয় উত্তর দিন 🌷",
  },
  addPhotosVideos: { en: "Add photos or videos", bn: "ছবি বা ভিডিও যোগ করুন" },
  upToFiles: { en: "Up to {n} files", bn: "সর্বোচ্চ {n}টি ফাইল" },
  allCohort: { en: "all", bn: "সব" },

  // Marketplace
  listItem: { en: "List item", bn: "পণ্য যোগ করুন" },
  description: { en: "Description", bn: "বিবরণ" },
  reviews: { en: "Reviews", bn: "রিভিউ" },
  location: { en: "Location", bn: "অবস্থান" },
  condition: { en: "Condition", bn: "অবস্থা" },
  category: { en: "Category", bn: "ক্যাটাগরি" },
  seller: { en: "Seller", bn: "বিক্রেতা" },
  verified: { en: "Verified", bn: "যাচাইকৃত" },
  call: { en: "Call", bn: "কল" },
  message: { en: "Message", bn: "মেসেজ" },
  contactSeller: { en: "Contact seller", bn: "বিক্রেতার সাথে যোগাযোগ" },
  free: { en: "Free", bn: "ফ্রি" },
  posted: { en: "Posted", bn: "পোস্ট করা হয়েছে" },
  averageRating: { en: "average", bn: "গড়" },
  noReviews: {
    en: "No reviews yet — be the first to share your experience after purchasing.",
    bn: "এখনও কোনো রিভিউ নেই — কেনার পর প্রথম হয়ে আপনার অভিজ্ঞতা শেয়ার করুন।",
  },
  listingUnavailable: { en: "This listing isn't available.", bn: "এই পণ্যটি উপলব্ধ নেই।" },
  backToMarket: { en: "Back to marketplace", bn: "মার্কেটপ্লেসে ফিরুন" },
  safetyNote: {
    en: "Always meet in a safe, public place. Momota doesn't handle payments — agree directly with the seller.",
    bn: "সবসময় নিরাপদ, পাবলিক স্থানে দেখা করুন। Momota পেমেন্ট পরিচালনা করে না — বিক্রেতার সাথে সরাসরি সম্মত হন।",
  },

  // Medical
  medicalTitle: { en: "Your Health Hub", bn: "আপনার স্বাস্থ্য হাব" },
  medicalSubtitle: {
    en: "AI-personalized care signals, verified news from health authorities & community partners.",
    bn: "AI-ব্যক্তিগতকৃত স্বাস্থ্য সংকেত, স্বাস্থ্য কর্তৃপক্ষ ও কমিউনিটি পার্টনারদের যাচাইকৃত সংবাদ।",
  },
  todaysAlerts: { en: "Today's alerts", bn: "আজকের সতর্কতা" },
  forMother: { en: "For mother", bn: "মায়ের জন্য" },
  forBaby: { en: "For baby", bn: "শিশুর জন্য" },
  medNewsCombined: { en: "News & community updates", bn: "সংবাদ ও কমিউনিটি আপডেট" },
  medOfficialNews: { en: "Official news", bn: "অফিসিয়াল সংবাদ" },
  medNgoNews: { en: "NGO & community updates", bn: "এনজিও ও কমিউনিটি আপডেট" },
  medForYou: { en: "For you", bn: "আপনার জন্য" },
  medHealthAnalytics: { en: "Health signals", bn: "স্বাস্থ্য সংকেত" },
  medMom: { en: "Mom", bn: "মা" },
  medBaby: { en: "Baby", bn: "শিশু" },
  medHelpUsKnow: { en: "Help us know you better", bn: "আপনাকে আরও জানতে সাহায্য করুন" },
  medTakeQuiz: { en: "Start a quick check-in", bn: "ছোট একটি চেক-ইন শুরু করুন" },
  medQuizSubtitle: {
    en: "A few gentle prompts — your answers shape your personalized care signals.",
    bn: "কয়েকটি কোমল প্রম্পট — আপনার উত্তর আপনার ব্যক্তিগতকৃত যত্ন সংকেত তৈরি করে।",
  },
  medQuizYes: { en: "Yes", bn: "হ্যাঁ" },
  medQuizNo: { en: "Not yet", bn: "এখনও না" },
  medQuizIdk: { en: "Not sure", bn: "নিশ্চিত নই" },
  medQuizDone: {
    en: "Thank you — your care signals are updated.",
    bn: "ধন্যবাদ — আপনার যত্নের সংকেত হালনাগাদ হয়েছে।",
  },

  medAskMidwife: { en: "Ask the midwife", bn: "মিডওয়াইফকে জিজ্ঞাসা করুন" },
  medScore: { en: "Coverage score", bn: "কভারেজ স্কোর" },
  medSource: { en: "Source", bn: "সূত্র" },
  medLockedTitle: { en: "Complete your registration", bn: "নিবন্ধন সম্পূর্ণ করুন" },
  medLockedBody: {
    en: "Verify your account to unlock personalized care signals, AI tips and reminders tailored to you and your baby.",
    bn: "আপনার অ্যাকাউন্ট যাচাই করুন এবং আপনার ও আপনার শিশুর জন্য ব্যক্তিগতকৃত যত্নের সংকেত, AI পরামর্শ ও রিমাইন্ডার আনলক করুন।",
  },
  medLockedCta: { en: "Finish verification", bn: "যাচাইকরণ শেষ করুন" },
  medAnalyticsCohort: { en: "Cohort coverage", bn: "কোহর্ট কভারেজ" },
  medAnalyticsNearby: { en: "Health alerts nearby", bn: "কাছের স্বাস্থ্য সতর্কতা" },
  medAnalyticsTrends: { en: "Weekly check-in trend", bn: "সাপ্তাহিক চেক-ইন প্রবণতা" },
  quickNeedHelp: { en: "Do you need help right now?", bn: "এখনই সাহায্য দরকার?" },
  quickFeelUnwell: { en: "Feeling unwell today?", bn: "আজ অসুস্থ লাগছে?" },
  quickTalkDoctor: { en: "Want to talk to a doctor?", bn: "ডাক্তারের সাথে কথা বলতে চান?" },
  quickDismiss: { en: "Dismiss", bn: "বাতিল করুন" },

  // Midwife
  midwifeTitle: { en: "Digital Midwife", bn: "ডিজিটাল মিডওয়াইফ" },
  midwifeSubtitle: {
    en: "A gentle helper for everyday questions — not a replacement for your doctor.",
    bn: "প্রতিদিনের প্রশ্নের জন্য একটি কোমল সহায়ক — আপনার ডাক্তারের বিকল্প নয়।",
  },
  midwifeIntro: {
    en: "Hello 🌷 I'm your Digital Midwife. I share verified information and can route you to real clinicians. I won't diagnose or prescribe — please always consult a doctor for medical decisions.",
    bn: "হ্যালো 🌷 আমি আপনার ডিজিটাল মিডওয়াইফ। আমি যাচাইকৃত তথ্য শেয়ার করি এবং প্রকৃত চিকিৎসকের কাছে পাঠাতে পারি। আমি রোগ নির্ণয় বা প্রেসক্রিপশন করব না — চিকিৎসা সিদ্ধান্তের জন্য সর্বদা ডাক্তারের পরামর্শ নিন।",
  },
  midwifeUrgent: {
    en: "What you described sounds urgent. Please reach a clinician immediately — here's the closest verified facility based on your profile.",
    bn: "আপনি যা বর্ণনা করেছেন তা জরুরি মনে হচ্ছে। অনুগ্রহ করে অবিলম্বে একজন চিকিৎসকের কাছে পৌঁছান — আপনার প্রোফাইল অনুযায়ী নিকটতম যাচাইকৃত সুবিধা এখানে।",
  },
  midwifeGeneric: {
    en: "This is general information and not a diagnosis. For your stage, please make sure you're up to date with EPI vaccinations and balanced nutrition. Would you like me to find a nearby clinic?",
    bn: "এটি সাধারণ তথ্য, রোগ নির্ণয় নয়। আপনার পর্যায়ের জন্য, EPI টিকা ও সুষম পুষ্টি নিশ্চিত করুন। নিকটস্থ ক্লিনিক খুঁজে দেব?",
  },
  getHelpNow: { en: "Get help now", bn: "এখনই সাহায্য নিন" },
  askPlaceholder: {
    en: "Ask anything about pregnancy, baby care...",
    bn: "গর্ভাবস্থা বা শিশু যত্ন সম্পর্কে যেকোনো কিছু জিজ্ঞাসা করুন...",
  },

  // Profile
  tabMother: { en: "Mother", bn: "মা" },
  tabBaby: { en: "Baby", bn: "শিশু" },
  tabMedical: { en: "Medical", bn: "মেডিকেল" },
  tabSettings: { en: "Settings", bn: "সেটিংস" },
  aboutYou: { en: "About you", bn: "আপনার সম্পর্কে" },
  aboutBaby: { en: "About your baby", bn: "আপনার শিশুর সম্পর্কে" },
  medicalInfo: { en: "Medical information (private)", bn: "চিকিৎসা তথ্য (গোপন)" },
  settings: { en: "Settings", bn: "সেটিংস" },
  language: { en: "Language", bn: "ভাষা" },
  languageHelp: {
    en: "Switch the entire app between English and Bangla.",
    bn: "পুরো অ্যাপ ইংরেজি ও বাংলার মধ্যে পরিবর্তন করুন।",
  },
  changePassword: { en: "Change password", bn: "পাসওয়ার্ড পরিবর্তন" },
  changePasswordHelp: {
    en: "We'll send a verification code to your number.",
    bn: "আমরা আপনার নম্বরে একটি কোড পাঠাব।",
  },
  fullName: { en: "Full name", bn: "পুরো নাম" },
  dob: { en: "Date of birth", bn: "জন্ম তারিখ" },
  occupation: { en: "Occupation", bn: "পেশা" },
  education: { en: "Education", bn: "শিক্ষা" },
  diet: { en: "Dietary preferences", bn: "খাদ্যাভ্যাস" },
  bloodGroup: { en: "Blood group", bn: "রক্তের গ্রুপ" },
  babyName: { en: "Baby's name", bn: "শিশুর নাম" },
  edd: { en: "Expected delivery (if pregnant)", bn: "প্রত্যাশিত প্রসব (যদি গর্ভবতী)" },
  sex: { en: "Sex", bn: "লিঙ্গ" },
  birthWeight: { en: "Birth weight (kg)", bn: "জন্ম ওজন (কেজি)" },
  feeding: { en: "Feeding type", bn: "খাওয়ানোর ধরন" },
  allergies: { en: "Allergies", bn: "অ্যালার্জি" },
  motherBlood: { en: "Mother's blood group", bn: "মায়ের রক্তের গ্রুপ" },
  babyBlood: { en: "Baby's blood group", bn: "শিশুর রক্তের গ্রুপ" },
  chronic: { en: "Chronic conditions", bn: "দীর্ঘস্থায়ী অবস্থা" },
  medications: { en: "Current medications", bn: "বর্তমান ওষুধ" },
  lastCheckup: { en: "Last checkup", bn: "শেষ চেকআপ" },
  vaccinations: { en: "Vaccination log", bn: "টিকার রেকর্ড" },
  phone: { en: "Phone number", bn: "ফোন নম্বর" },
  welcome: { en: "Welcome", bn: "স্বাগতম" },
  statusVerified: { en: "Verified", bn: "যাচাইকৃত" },
  statusPending: { en: "Pending review", bn: "পর্যালোচনাধীন" },
  statusBanned: { en: "Banned", bn: "নিষিদ্ধ" },
  selectPlaceholder: { en: "Select…", bn: "নির্বাচন করুন…" },
  optGirl: { en: "Girl", bn: "মেয়ে" },
  optBoy: { en: "Boy", bn: "ছেলে" },
  optOther: { en: "Other", bn: "অন্যান্য" },
  optBreast: { en: "Breast", bn: "মাতৃদুগ্ধ" },
  optFormula: { en: "Formula", bn: "ফর্মুলা" },
  optMixed: { en: "Mixed", bn: "মিশ্র" },
  optSolids: { en: "Solids", bn: "শক্ত খাবার" },
  signOutBtn: { en: "Sign out", bn: "সাইন আউট" },
  english: { en: "English", bn: "ইংরেজি" },
  bangla: { en: "বাংলা", bn: "বাংলা" },

  // Landing
  forMothersByMothers: { en: "For mothers, by mothers", bn: "মায়েদের জন্য, মায়েদের দ্বারা" },
  heroTitle: { en: "You're never alone in this journey.", bn: "এই যাত্রায় আপনি কখনো একা নন।" },
  heroSubtitle: {
    en: "Momota is a safe, women-only space for mothers across Bangladesh — with a trusted community, a gentle AI midwife, and verified medical alerts you can rely on.",
    bn: "Momota বাংলাদেশের মায়েদের জন্য একটি নিরাপদ, শুধুমাত্র নারীদের স্থান — একটি বিশ্বস্ত কমিউনিটি, একজন কোমল AI মিডওয়াইফ এবং নির্ভরযোগ্য যাচাইকৃত চিকিৎসা সতর্কতা সহ।",
  },
  beginGently: { en: "Begin gently", bn: "শুরু করুন" },
  seeAlerts: { en: "See today's alerts", bn: "আজকের সতর্কতা দেখুন" },
  pillarsTitle: {
    en: "Built around what mothers actually need",
    bn: "মায়েদের প্রকৃত প্রয়োজন কেন্দ্র করে তৈরি",
  },
  privacyTitle: { en: "Privacy is the first promise.", bn: "গোপনীয়তা প্রথম প্রতিশ্রুতি।" },
  privacyBody: {
    en: "Posts, chats, and uploads are stripped of personal information before they ever touch our analytics. The AI never diagnoses — it informs and routes you to real clinicians.",
    bn: "পোস্ট, চ্যাট এবং আপলোড আমাদের অ্যানালিটিক্সে যাওয়ার আগে ব্যক্তিগত তথ্য সরানো হয়। AI কখনো রোগ নির্ণয় করে না — এটি তথ্য দেয় এবং প্রকৃত চিকিৎসকের কাছে পাঠায়।",
  },
  joinMomota: { en: "Join Momota", bn: "Momota-এ যোগ দিন" },
  emergencyHelpline: { en: "Emergency helpline:", bn: "জরুরি হেল্পলাইন:" },

  // RequireTier gate
  gateTitle: { en: "Just one quick step", bn: "শুধু একটি ছোট ধাপ" },
  gateBody: {
    en: "To keep this space safe and women-only, please finish verification. It only takes a minute — your privacy is protected.",
    bn: "এই স্থান নিরাপদ ও শুধু নারীদের জন্য রাখতে, দয়া করে যাচাইকরণ সম্পন্ন করুন। মাত্র এক মিনিট লাগবে — আপনার গোপনীয়তা সুরক্ষিত।",
  },
  gateCta: { en: "Continue verification", bn: "যাচাইকরণ চালিয়ে যান" },
  gateBrowse: { en: "Browse medical info instead →", bn: "চিকিৎসা তথ্য দেখুন →" },
  gatePending: {
    en: "Your NID is under review. We'll unlock the community as soon as our team approves it (usually within 24 hours).",
    bn: "আপনার এনআইডি পর্যালোচনাধীন। আমাদের টিম অনুমোদন করার সাথে সাথেই কমিউনিটি খুলে যাবে (সাধারণত ২৪ ঘন্টার মধ্যে)।",
  },

  // Onboarding success
  completeProfileTitle: { en: "Make Momota truly yours", bn: "Momota-কে সম্পূর্ণ আপনার করুন" },
  completeProfileBody: {
    en: "Complete your profile to get personalized tips, timely alerts and a stronger community match.",
    bn: "ব্যক্তিগতকৃত পরামর্শ, সময়মতো সতর্কতা এবং কমিউনিটিতে আরও ভালো মিলের জন্য আপনার প্রোফাইল পূরণ করুন।",
  },
  completeProfileCta: { en: "Complete profile", bn: "প্রোফাইল পূরণ করুন" },
  enterCommunity: { en: "Enter the community", bn: "কমিউনিটিতে প্রবেশ করুন" },

  // NID submitted
  nidPendingTitle: { en: "Your NID is being verified 🛡️", bn: "আপনার এনআইডি যাচাই করা হচ্ছে 🛡️" },
  nidPendingBody: {
    en: "Our team typically reviews submissions within 24 hours. You'll get a notification as soon as you're approved — and you can browse medical info in the meantime.",
    bn: "আমাদের টিম সাধারণত ২৪ ঘন্টার মধ্যে যাচাই করে। অনুমোদিত হলে আপনি নোটিফিকেশন পাবেন — এই সময়ে আপনি মেডিকেল তথ্য দেখতে পারেন।",
  },

  // Marketplace coming soon
  marketSoonTitle: { en: "Marketplace is coming soon", bn: "মার্কেটপ্লেস শীঘ্রই আসছে" },
  marketSoonBody: {
    en: "A safe, mother-to-mother space to share, donate and trade baby essentials. We're polishing the experience — check back soon.",
    bn: "শিশুর জিনিসপত্র শেয়ার, দান ও আদান-প্রদানের জন্য একটি নিরাপদ, মা-থেকে-মা স্থান। আমরা অভিজ্ঞতাটি পরিপাটি করছি — শীঘ্রই দেখুন।",
  },

  // Onboarding flow
  onbStep: { en: "Step", bn: "ধাপ" },
  onbOf: { en: "of", bn: "/" },
  onbWelcomeTitle: { en: "Welcome 🤍", bn: "স্বাগতম 🤍" },
  onbWelcomeBody: {
    en: "Enter your mobile number to begin — we'll text you a one-time code to keep your account safe.",
    bn: "শুরু করতে আপনার মোবাইল নম্বর দিন — আপনার অ্যাকাউন্ট নিরাপদ রাখতে আমরা একটি ওয়ান-টাইম কোড পাঠাব।",
  },
  onbMobile: { en: "Mobile number", bn: "মোবাইল নম্বর" },
  onbSendCode: { en: "Send code", bn: "কোড পাঠান" },
  onbPhonePh: { en: "+8801XXXXXXXXX", bn: "+8801XXXXXXXXX" },
  onbAlreadyRegistered: { en: "Already have an account?", bn: "ইতিমধ্যে অ্যাকাউন্ট আছে?" },
  onbSignInOtp: { en: "Sign in with OTP", bn: "OTP দিয়ে সাইন ইন করুন" },
  onbVerifyTitle: { en: "Verify your number", bn: "আপনার নম্বর যাচাই করুন" },
  onbVerifyBody: {
    en: "We just sent a 6-digit code. (Demo: any 6 digits work.)",
    bn: "আমরা একটি ৬-সংখ্যার কোড পাঠিয়েছি। (ডেমো: যেকোনো ৬ ডিজিট কাজ করবে।)",
  },
  onbCode: { en: "Code", bn: "কোড" },
  onbOtpPh: { en: "••••••", bn: "••••••" },
  onbContinue: { en: "Continue", bn: "এগিয়ে যান" },
  onbNameTitle: { en: "What should we call you?", bn: "আমরা আপনাকে কী নামে ডাকব?" },
  onbNameBody: {
    en: "Use the name you'd like other mothers to see — it stays on your profile only.",
    bn: "আপনি যে নামে অন্য মায়েদের কাছে পরিচিত হতে চান, সেটি দিন — শুধু আপনার প্রোফাইলে দেখা যাবে।",
  },
  onbNamePh: { en: "e.g. Nusrat Akter", bn: "যেমন নুসরাত আক্তার" },
  onbLocTitle: { en: "Where are you based?", bn: "আপনি কোথায় আছেন?" },
  onbLocBody: {
    en: "We'll show you the closest verified clinics and pharmacies if you ever need them.",
    bn: "প্রয়োজনে আমরা আপনাকে নিকটতম যাচাইকৃত ক্লিনিক ও ফার্মেসি দেখাব।",
  },
  onbDistrict: { en: "District", bn: "জেলা" },
  onbSelectDistrict: { en: "Select your district", bn: "আপনার জেলা নির্বাচন করুন" },
  onbUpazila: { en: "Upazila / Thana", bn: "উপজেলা / থানা" },
  onbUpzPh: { en: "e.g. Dhanmondi", bn: "যেমন ধানমন্ডি" },
  onbChildTitle: { en: "Tell us about your baby", bn: "আপনার শিশুর সম্পর্কে বলুন" },
  onbChildBody: {
    en: "This personalizes everything — tips, reminders and community matches will fit your stage.",
    bn: "এতে সব কিছু ব্যক্তিগতকৃত হবে — পরামর্শ, রিমাইন্ডার ও কমিউনিটি মিল আপনার পর্যায়ের সাথে মানানসই হবে।",
  },
  onbPregnant: { en: "I'm pregnant", bn: "আমি গর্ভবতী" },
  onbExpecting: { en: "Expecting a baby", bn: "শিশুর প্রত্যাশায়" },
  onbBabyHere: { en: "My baby is here", bn: "আমার শিশু এসেছে" },
  onbBabyAge: { en: "0–5 years old", bn: "০–৫ বছর" },
  onbEdd: { en: "Expected delivery date", bn: "প্রত্যাশিত প্রসবের তারিখ" },
  onbBabyDob: { en: "Baby's date of birth", bn: "শিশুর জন্ম তারিখ" },
  onbInviteTitle: {
    en: "Were you invited by a mother?",
    bn: "কোনো মা আপনাকে আমন্ত্রণ জানিয়েছেন?",
  },
  onbInviteBody: {
    en: "An invite from a verified mother lets you skip the selfie check.",
    bn: "একজন যাচাইকৃত মায়ের আমন্ত্রণে সেলফি যাচাইকরণ এড়াতে পারবেন।",
  },
  onbInviteLabel: { en: "Invite code (optional)", bn: "আমন্ত্রণ কোড (ঐচ্ছিক)" },
  onbInvitePh: { en: "e.g. NUSRAT-7421", bn: "যেমন NUSRAT-7421" },
  onbUseInvite: { en: "Use invite — finish", bn: "আমন্ত্রণ ব্যবহার করে শেষ করুন" },
  onbNoInvite: { en: "I don't have one — continue", bn: "আমার কাছে নেই — চালিয়ে যান" },
  onbCvTitle: { en: "Quick selfie check", bn: "ছোট সেলফি যাচাইকরণ" },
  onbCvBody: {
    en: "A short selfie keeps this community women-only. Your photo is sent securely to our team for verification — nothing is stored on your device.",
    bn: "ছোট একটি সেলফি এই কমিউনিটিকে শুধু নারীদের জন্য রাখে। আপনার ছবি যাচাইয়ের জন্য নিরাপদভাবে আমাদের টিমের কাছে পাঠানো হয় — আপনার ডিভাইসে কিছু সংরক্ষণ করা হয় না।",
  },
  onbCvStart: { en: "Open camera", bn: "ক্যামেরা চালু করুন" },
  onbCvCapture: { en: "Capture photo", bn: "ছবি তুলুন" },
  onbCvRetake: { en: "Retake", bn: "আবার তুলুন" },
  onbCvSubmit: { en: "Submit for verification", bn: "যাচাইয়ের জন্য পাঠান" },
  onbCvAllow: {
    en: "Please allow camera access when your browser asks.",
    bn: "ব্রাউজার অনুমতি চাইলে ক্যামেরা ব্যবহারের অনুমতি দিন।",
  },
  onbCvDenied: {
    en: "Camera access was blocked. You can still upload your NID instead.",
    bn: "ক্যামেরা অ্যাক্সেস বন্ধ। বিকল্প হিসেবে এনআইডি আপলোড করতে পারেন।",
  },
  onbCvVerifying: {
    en: "Verifying your photo securely…",
    bn: "আপনার ছবি নিরাপদভাবে যাচাই করা হচ্ছে…",
  },
  onbCvUploadNid: { en: "Upload NID instead", bn: "পরিবর্তে এনআইডি আপলোড করুন" },
  onbNidTitle: { en: "Upload your NID", bn: "আপনার এনআইডি আপলোড করুন" },
  onbNidBody: {
    en: "Please make sure the information on the picture is clearly visible — all four corners showing, good lighting, no glare and the text easy to read. Our team reviews within 24 hours.",
    bn: "অনুগ্রহ করে নিশ্চিত করুন ছবির তথ্য পরিষ্কারভাবে দেখা যাচ্ছে — চার কোণ, ভালো আলো, কোনো প্রতিফলন নেই এবং লেখা সহজে পড়া যাচ্ছে। আমাদের টিম ২৪ ঘণ্টার মধ্যে যাচাই করে।",
  },
  onbNidPick: { en: "Tap to upload NID photo", bn: "এনআইডি ছবি আপলোড করতে ট্যাপ করুন" },
  onbNidTips: {
    en: "Tips: place on a dark surface, fill the frame, avoid blur.",
    bn: "টিপস: গাঢ় জায়গায় রাখুন, ফ্রেম পূরণ করুন, ঝাপসা এড়িয়ে চলুন।",
  },
  onbNidSubmit: { en: "Submit for review", bn: "পর্যালোচনার জন্য পাঠান" },
  onbNidSubmitting: { en: "Submitting…", bn: "পাঠানো হচ্ছে…" },
  onbDoneTitle: { en: "You're in 🌸", bn: "আপনি ভেতরে 🌸" },
  onbDoneBody: {
    en: "Welcome to the Momota family. Take a deep breath — we've got you.",
    bn: "Momota পরিবারে স্বাগতম। গভীর শ্বাস নিন — আমরা আপনার পাশে আছি।",
  },
  onbAgree: {
    en: "By continuing you agree to keep this space safe and respectful.",
    bn: "চালিয়ে যাওয়ার মাধ্যমে আপনি এই স্থানকে নিরাপদ ও সম্মানজনক রাখতে সম্মত হচ্ছেন।",
  },
  onbBack: { en: "Back", bn: "পেছনে" },

  // Errors
  errOtpSend: {
    en: "Failed to send OTP. Please try again.",
    bn: "ওটিপি পাঠাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
  },
  errOtpInvalid: { en: "Invalid OTP. Please try again.", bn: "ভুল ওটিপি। আবার চেষ্টা করুন।" },
  errProfileSave: {
    en: "Failed to save profile information.",
    bn: "প্রোফাইল তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে।",
  },
  errCvFailed: { en: "Camera verification failed.", bn: "ক্যামেরা যাচাইকরণ ব্যর্থ হয়েছে।" },
  errNidUpload: { en: "NID upload failed.", bn: "এনআইডি আপলোড ব্যর্থ হয়েছে।" },

  // Login
  loginTitle: { en: "Welcome back 🤍", bn: "আবার স্বাগতম 🤍" },
  loginBody: {
    en: "Sign in with the mobile number you registered — we'll send a one-time code.",
    bn: "আপনি যে মোবাইল নম্বরে নিবন্ধন করেছেন সেটি দিয়ে সাইন ইন করুন — আমরা ওয়ান-টাইম কোড পাঠাব।",
  },
  loginNoAccount: {
    en: "We couldn't find an account with that number. Please sign up first.",
    bn: "এই নম্বরের কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে আগে সাইন আপ করুন।",
  },
  loginNotFound: { en: "Account not found.", bn: "অ্যাকাউন্ট পাওয়া যায়নি।" },
  loginNewHere: { en: "New here?", bn: "নতুন?" },
  loginCreateAcct: { en: "Create an account", bn: "অ্যাকাউন্ট তৈরি করুন" },
  loginCodeTitle: { en: "Enter your code", bn: "আপনার কোড দিন" },
  loginCodeBody: {
    en: "We just sent a 6-digit code. (Demo: any 6 digits work.)",
    bn: "আমরা একটি ৬-সংখ্যার কোড পাঠিয়েছি। (ডেমো: যেকোনো ৬ ডিজিট কাজ করবে।)",
  },
  loginSignIn: { en: "Sign in", bn: "সাইন ইন" },
} as const;

export type DictKey = keyof typeof dict;

export function useT() {
  const { user } = useAuth();
  return React.useCallback(
    (key: DictKey) => dict[key]?.[user.language] ?? (key as string),
    [user.language],
  );
}

// Set the html lang attribute when the user's language changes.
export function useLangAttribute() {
  const { user } = useAuth();
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = user.language === "bn" ? "bn" : "en";
    }
  }, [user.language]);
}
