export type Cohort = "pregnancy" | "0-6m" | "6-12m" | "1-2y" | "2-5y";

export type Comment = {
  id: string;
  author: { name: string; district?: string; avatarHue: number };
  text: string;
  timeAgo: string;
  likes: number;
  liked: boolean;
};

export type Post = {
  id: string;
  author: { name: string; district: string; avatarHue: number };
  cohort: Cohort;
  timeAgo: string;
  text: string;
  images: string[];
  likes: number;
  liked: boolean;
  comments: Comment[];
};

export type Listing = {
  id: string;
  title: string;
  price: number;
  condition: "new" | "like-new" | "good" | "fair";
  category: string;
  district: string;
  upazila: string;
  seller: { name: string; phone: string; rating: number; reviews: number };
  description: string;
  images: string[];
  featured?: boolean;
  reviews?: ListingReview[];
  postedAgo?: string;
};

export type ListingReview = {
  id: string;
  author: string;
  rating: number;
  text: string;
  timeAgo: string;
};

export type Category = { id: string; name: string; icon: string };

export type Alert = {
  id: string;
  title: string;
  body: string;
  level: "info" | "warning" | "success";
  source: string;
};

export type NewsItem = {
  id: string;
  audience: "mother" | "baby";
  source: string;
  date: string;
  title: string;
  summary: string;
};

export type MidwifeSuggestion = { id: string; text: string };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  emergency?: {
    hospital: string;
    address: string;
    upazila: string;
    helpline: string;
  };
};
