import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BlogPost,
  Conversation,
  Pagination,
  Project,
  Quotation,
  User,
  VideoRecord,
} from "../types";

import api from "../api/client";

/* ── Query Keys ──────────────────────────────────────────────────────────── */
export const QK = {
  me: ["me"] as const,
  projects: (p?: any) => ["projects", p] as const,
  projectsFeatured: ["projects", "featured"] as const,
  projectStats: ["project-stats"] as const,
  project: (id: string) => ["project", id] as const,
  adminProjects: (p?: any) => ["admin-projects", p] as const,
  blogPosts: (p?: any) => ["blog-posts", p] as const,
  blogPost: (slug: string) => ["blog-post", slug] as const,
  adminBlogPosts: (p?: any) => ["admin-blog-posts", p] as const,
  quotations: ["my-quotations"] as const,
  quotation: (id: string) => ["quotation", id] as const,
  adminQuotations: (p?: any) => ["admin-quotations", p] as const,
  conversations: ["conversations"] as const,
  messages: (id: string) => ["messages", id] as const,
  reviews: (p?: any) => ["reviews", p] as const,
  adminReviews: ["admin-reviews"] as const,
  adminUsers: (p?: any) => ["admin-users", p] as const,
  adminContacts: ["admin-contacts"] as const,
  analytics: ["analytics"] as const,
  videos: ["videos"] as const,
  adminVideos: ["admin-videos"] as const,
};

/* ── Auth ────────────────────────────────────────────────────────────────── */
export const useRegister = () =>
  useMutation({
    mutationFn: (d: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) =>
      api
        .post<{ token: string; user: User }>("/auth/register", d)
        .then((r) => r.data),
  });

export const useLogin = () =>
  useMutation({
    mutationFn: (d: { email: string; password: string }) =>
      api
        .post<{ token: string; user: User }>("/auth/login", d)
        .then((r) => r.data),
  });

export const useMe = (enabled = true) =>
  useQuery({
    queryKey: QK.me,
    queryFn: () => api.get<{ user: User }>("/auth/me").then((r) => r.data.user),
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
  });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: { name: string; phone?: string }) =>
      api.put<{ user: User }>("/auth/profile", d).then((r) => r.data.user),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.me }),
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (d: { currentPassword: string; newPassword: string }) =>
      api.put("/auth/password", d).then((r) => r.data),
  });

export const useSendOtp = () =>
  useMutation({
    mutationFn: (d: { email: string }) =>
      api.post<{ message: string }>("/auth/send-otp", d).then((r) => r.data),
  });

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: (d: { email: string; code: string }) =>
      api.post<{ message: string }>("/auth/verify-otp", d).then((r) => r.data),
  });

export const useRequestPasswordReset = () =>
  useMutation({
    mutationFn: (d: { email: string }) =>
      api
        .post<{ message: string }>("/auth/request-password-reset", d)
        .then((r) => r.data),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: (d: { id: string; token: string; password: string }) =>
      api
        .post<{ message: string }>("/auth/reset-password", d)
        .then((r) => r.data),
  });

/* ── Projects ────────────────────────────────────────────────────────────── */
export const useProjects = (params?: Record<string, any>) =>
  useQuery({
    queryKey: QK.projects(params),
    queryFn: () =>
      api
        .get<{
          projects: Project[];
          pagination: Pagination;
        }>("/projects", { params })
        .then((r) => r.data),
    staleTime: 2 * 60_000,
  });

export const useFeaturedProjects = () =>
  useQuery({
    queryKey: QK.projectsFeatured,
    queryFn: () =>
      api
        .get<{
          projects: Project[];
        }>("/projects", { params: { featured: true, limit: 6 } })
        .then((r) => r.data.projects),
    staleTime: 5 * 60_000,
  });

export const useProject = (id: string) =>
  useQuery({
    queryKey: QK.project(id),
    queryFn: () =>
      api
        .get<{ project: Project }>(`/projects/${id}`)
        .then((r) => r.data.project),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });

export const useProjectStats = () =>
  useQuery({
    queryKey: QK.projectStats,
    queryFn: () =>
      api
        .get<{
          total: number;
          completed: number;
          ongoing: number;
          upcoming: number;
        }>("/projects/stats")
        .then((r) => r.data),
    staleTime: 5 * 60_000,
  });

export const useAdminProjects = (params?: Record<string, any>) =>
  useQuery({
    queryKey: QK.adminProjects(params),
    queryFn: () =>
      api
        .get<{
          projects: Project[];
          pagination: Pagination;
        }>("/projects/admin/all", { params })
        .then((r) => r.data),
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Partial<Project>) =>
      api
        .post<{ project: Project }>("/projects", d)
        .then((r) => r.data.project),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: QK.projectStats });
    },
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      api
        .put<{ project: Project }>(`/projects/${id}`, data)
        .then((r) => r.data.project),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: QK.project(id) });
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: QK.projectStats });
    },
  });
};

export const useTogglePublish = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api
        .patch<{ project: Project }>(`/projects/${id}/publish`)
        .then((r) => r.data.project),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
    },
  });
};

/* ── Blog ──────────────────────────────────────────────────────────────── */
export const useBlogPosts = (params?: Record<string, any>) =>
  useQuery({
    queryKey: QK.blogPosts(params),
    queryFn: () =>
      api
        .get<{
          posts: BlogPost[];
          pagination: Pagination;
        }>("/blogs", { params })
        .then((r) => r.data),
    staleTime: 3 * 60_000,
  });

export const useBlogPost = (slug: string) =>
  useQuery({
    queryKey: QK.blogPost(slug),
    queryFn: () =>
      api.get<{ post: BlogPost }>(`/blogs/${slug}`).then((r) => r.data.post),
    enabled: !!slug,
    staleTime: 3 * 60_000,
  });

export const useAdminBlogPosts = (params?: Record<string, any>) =>
  useQuery({
    queryKey: QK.adminBlogPosts(params),
    queryFn: () =>
      api
        .get<{
          posts: BlogPost[];
          pagination: Pagination;
        }>("/blogs/admin/all", { params })
        .then((r) => r.data),
  });

export const useCreateBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<BlogPost>) =>
      api.post<{ post: BlogPost }>("/blogs", data).then((r) => r.data.post),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      qc.invalidateQueries({ queryKey: ["blog-post"] });
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    },
  });
};

export const useUpdateBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogPost> }) =>
      api
        .put<{ post: BlogPost }>(`/blogs/${id}`, data)
        .then((r) => r.data.post),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      qc.invalidateQueries({ queryKey: ["blog-post"] });
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    },
  });
};

export const useDeleteBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/blogs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      qc.invalidateQueries({ queryKey: ["blog-post"] });
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    },
  });
};

export const useToggleBlogPublish = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api
        .patch<{ post: BlogPost }>(`/blogs/${id}/publish`)
        .then((r) => r.data.post),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      qc.invalidateQueries({ queryKey: ["blog-post"] });
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    },
  });
};

/* ── Quotations ──────────────────────────────────────────────────────────── */
export const useCreateQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Partial<Quotation>) =>
      api
        .post<{
          quotation: Quotation;
          conversationId: string;
        }>("/quotations", d)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.quotations });
      qc.invalidateQueries({ queryKey: QK.conversations });
    },
  });
};

export const useMyQuotations = () =>
  useQuery({
    queryKey: QK.quotations,
    queryFn: () =>
      api
        .get<{ quotations: Quotation[] }>("/quotations/my")
        .then((r) => r.data.quotations),
    refetchInterval: 30_000,
  });

export const useQuotation = (id: string) =>
  useQuery({
    queryKey: QK.quotation(id),
    queryFn: () =>
      api
        .get<{ quotation: Quotation }>(`/quotations/${id}`)
        .then((r) => r.data.quotation),
    enabled: !!id,
  });

export const useAdminQuotations = (params?: Record<string, any>) =>
  useQuery({
    queryKey: QK.adminQuotations(params),
    queryFn: () =>
      api
        .get<{
          quotations: Quotation[];
          pagination: Pagination;
        }>("/quotations/admin/all", { params })
        .then((r) => r.data),
    refetchInterval: 30_000,
  });

export const useAdminUpdateQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quotation> }) =>
      api
        .put<{ quotation: Quotation }>(`/quotations/admin/${id}`, data)
        .then((r) => r.data.quotation),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-quotations"] }),
  });
};

/* ── Chat ────────────────────────────────────────────────────────────────── */
export const useConversations = (enabled = true) =>
  useQuery({
    queryKey: QK.conversations,
    queryFn: () =>
      api
        .get<{ conversations: Conversation[] }>("/chat/conversations")
        .then((r) => r.data.conversations),
    enabled,
    refetchInterval: 8_000,
  });

export const useMessages = (conversationId: string) =>
  useQuery({
    queryKey: QK.messages(conversationId),
    queryFn: () =>
      api
        .get(`/chat/conversations/${conversationId}/messages`)
        .then((r) => r.data),
    enabled: !!conversationId,
    refetchInterval: 4_000,
  });

export const useSendMessage = (conversationId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: { content: string; type?: string }) =>
      api
        .post(`/chat/conversations/${conversationId}/messages`, d)
        .then((r) => r.data.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.messages(conversationId) });
      qc.invalidateQueries({ queryKey: QK.conversations });
    },
  });
};

export const useGetOrCreateConversation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d?: { subject?: string }) =>
      api.post("/chat/conversations", d || {}).then((r) => r.data.conversation),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.conversations }),
  });
};

export const useCloseConversation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/chat/conversations/${id}/close`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.conversations }),
  });
};

/* ── Reviews ─────────────────────────────────────────────────────────────── */
export const usePublicReviews = (params?: Record<string, any>) =>
  useQuery({
    queryKey: QK.reviews(params),
    queryFn: () => api.get("/reviews", { params }).then((r) => r.data.reviews),
    staleTime: 10 * 60_000,
  });

export const useSubmitReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: {
      rating: number;
      title: string;
      content: string;
      project?: string;
    }) => api.post("/reviews", d).then((r) => r.data.review),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
};

export const useAdminReviews = () =>
  useQuery({
    queryKey: QK.adminReviews,
    queryFn: () => api.get("/reviews/admin").then((r) => r.data.reviews),
  });

export const useAdminToggleReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/reviews/admin/${id}/toggle`).then((r) => r.data.review),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.adminReviews });
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};

/* ── Contact ─────────────────────────────────────────────────────────────── */
export const useSubmitContact = () =>
  useMutation({
    mutationFn: (d: {
      name: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
    }) => api.post("/contact", d).then((r) => r.data),
  });

export const useAdminContacts = () =>
  useQuery({
    queryKey: QK.adminContacts,
    queryFn: () => api.get("/contact/admin").then((r) => r.data.contacts),
  });

/* ── Upload ──────────────────────────────────────────────────────────────── */
export const useUploadSingle = () =>
  useMutation({
    mutationFn: (fd: FormData) =>
      api
        .post("/upload/single", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data),
  });

export const useUploadMultiple = () =>
  useMutation({
    mutationFn: (fd: FormData) =>
      api
        .post("/upload/multiple", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data),
  });

/* ── Admin Users ─────────────────────────────────────────────────────────── */
export const useAdminUsers = (params?: Record<string, any>) =>
  useQuery({
    queryKey: QK.adminUsers(params),
    queryFn: () => api.get("/users", { params }).then((r) => r.data),
  });

export const useAdminToggleUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/users/${id}/toggle`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
};

/* ── Analytics (admin) ───────────────────────────────────────────────────── */
export const useAnalytics = () =>
  useQuery({
    queryKey: QK.analytics,
    queryFn: async () => {
      const [projects, quotations, users] = await Promise.all([
        api.get("/projects/stats").then((r) => r.data),
        api.get("/quotations/admin/stats").then((r) => r.data),
        api.get("/users", { params: { limit: 1 } }).then((r) => r.data),
      ]);
      return { projects, quotations, users };
    },
    staleTime: 60_000,
  });

/* ── Videos ──────────────────────────────────────────────────────────────── */
export const useVideos = (active = true) =>
  useQuery({
    queryKey: QK.videos,
    queryFn: () =>
      api
        .get<{ videos: VideoRecord[] }>("/videos", { params: { active } })
        .then((r) => r.data.videos),
    staleTime: 5 * 60_000,
  });

export const useAdminVideos = () =>
  useQuery({
    queryKey: QK.adminVideos,
    queryFn: () =>
      api
        .get<{ videos: any[] }>("/videos", { params: { active: false } })
        .then((r) => r.data.videos),
  });

export const useUploadVideo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) =>
      api
        .post("/videos/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data.video),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.videos });
      qc.invalidateQueries({ queryKey: QK.adminVideos });
    },
  });
};

export const useDeleteVideo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/videos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.videos });
      qc.invalidateQueries({ queryKey: QK.adminVideos });
    },
  });
};

export const useUpdateVideo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/videos/${id}`, data).then((r) => r.data.video),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.videos });
      qc.invalidateQueries({ queryKey: QK.adminVideos });
    },
  });
};
