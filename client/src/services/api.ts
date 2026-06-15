import axios from "axios";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../lib/auth";
import type { User, Child, Post, NidSubmission, Comment } from "../lib/api/types";

// 1. Axios client configuration instances
const GO_API_URL = "http://localhost:8080";
const CHATBOT_API_URL = "http://localhost:8005";
const VISION_API_URL = "http://localhost:8006";

export const apiClient = axios.create({
  baseURL: GO_API_URL,
});

export const chatClient = axios.create({
  baseURL: CHATBOT_API_URL,
});

// 2. Authorization interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("momota_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Types for requests/responses
export interface CompleteProfileRequest {
  name: string;
  district: string;
  upazila: string;
  stage: "pregnant" | "baby";
  date: string; // ISO date
}

export interface VerifyOTPResponse {
  token: string;
  user: User;
}

// 3. Strongly-typed wrapper functions for Go routes
export const api = {
  // Auth Routes
  requestOTP: async (phone: string) => {
    console.log("Mocking requestOTP for", phone);
    return { status: "success" };
  },

  verifyOTP: async (phone: string, code: string) => {
    console.log("Mocking verifyOTP for", phone, code);
    const mockUser: User = {
      id: "mock-user-id",
      phone: phone,
      name: "Mock User",
      language: "en",
      tier: 1,
      verified: false,
      created_at: new Date().toISOString(),
    };
    const data: VerifyOTPResponse = {
      token: "mock-jwt-token",
      user: mockUser,
    };
    // Save token to localStorage for the interceptor
    localStorage.setItem("momota_token", data.token);
    return data;
  },

  // User Onboarding
  completeProfile: async (profileData: CompleteProfileRequest) => {
    console.log("Mocking completeProfile", profileData);
    return { status: "success" };
  },

  uploadCameraVerification: async (formData: FormData) => {
    console.log("Mocking uploadCameraVerification");
    return { status: "success" };
  },

  uploadNID: async (formData: FormData) => {
    console.log("Mocking uploadNID");
    return { status: "success" };
  },

  // Feed Routes
  createPost: async (postData: { text: string; cohort: string; images: string[] }) => {
    console.log("Mocking createPost", postData);
    const mockPost: Post = {
      id: "mock-post-id",
      author_id: "mock-user-id",
      cohort: postData.cohort as any,
      body: postData.text,
      media: postData.images,
      likes: 0,
      comments_count: 0,
      reports: 0,
      hidden: false,
      created_at: new Date().toISOString(),
    };
    return mockPost;
  },

  getFeed: async (cohort: string) => {
    console.log("Mocking getFeed for cohort", cohort);
    return []; // Return empty array or some mock posts
  },

  toggleLike: async (postId: string) => {
    console.log("Mocking toggleLike for", postId);
    return { status: "success" };
  },

  createComment: async (postId: string, text: string) => {
    console.log("Mocking createComment for", postId, text);
    const mockComment: Comment = {
      id: "mock-comment-id",
      post_id: postId,
      author_id: "mock-user-id",
      body: text,
      likes: 0,
      created_at: new Date().toISOString(),
    };
    return mockComment;
  },

  // Admin Routes
  getPendingVerifications: async () => {
    console.log("Mocking getPendingVerifications");
    return [];
  },

  approveNID: async (userId: string) => {
    console.log("Mocking approveNID for", userId);
    return { status: "success" };
  },

  rejectNID: async (userId: string) => {
    console.log("Mocking rejectNID for", userId);
    return { status: "success" };
  },
};

// 1 Chatbot route
export const chatbot = {
  chat: async (message: string) => {
    const { data } = await chatClient.post<{ response: string }>("/chat", { message });
    return data;
  },
};

// 4. Routing guard hook
/**
 * Guard hook to prevent users with Tier < 3 from accessing community pages.
 * Redirects to the chatbot if access is blocked.
 */
export function useTierGuard(requireTier: number = 3) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user.tier < requireTier) {
      console.warn(
        `Access blocked: Tier ${user.tier} is insufficient for this page (requires ${requireTier}).`,
      );
      // Allow them only into Chatbot or public viewports (root or login)
      // Redirect to midwife chat by default if they try to access community
      navigate({ to: "/midwife" });
    }
  }, [user.tier, requireTier, navigate]);

  return user.tier >= requireTier;
}
