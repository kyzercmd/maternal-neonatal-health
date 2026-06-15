// Single source of truth for API paths. Adjust to match the Go server's routes.
export const endpoints = {
  // auth
  authRequestOtp: "/auth/otp/request",
  authVerifyOtp: "/auth/otp/verify",
  authLogout: "/auth/logout",

  // users / profile
  me: "/users/me",
  updateMe: "/users/me",
  updateChild: "/users/me/child",
  updateMedical: "/users/me/medical",

  // community
  posts: "/posts",
  post: (id: string) => `/posts/${id}`,
  postLike: (id: string) => `/posts/${id}/like`,
  postReport: (id: string) => `/posts/${id}/report`,
  postComments: (id: string) => `/posts/${id}/comments`,

  // marketplace
  listings: "/listings",
  listing: (id: string) => `/listings/${id}`,

  // midwife
  midwifeChat: "/midwife/chat",

  // medical content
  alerts: "/medical/alerts",
  news: "/medical/news",
  quizzes: "/medical/quizzes",
  quizAnswer: "/medical/quizzes/answer",
  medicalAnalytics: "/medical/analytics",

  // verification
  nidSubmit: "/verification/nid",

  // admin
  adminLogin: "/admin/login",
  adminPosts: "/admin/posts",
  adminListings: "/admin/listings",
  adminUsers: "/admin/users",
  adminNidQueue: "/admin/nid",
  adminNidReview: (id: string) => `/admin/nid/${id}`,
  adminAnalytics: "/admin/analytics",
} as const;
