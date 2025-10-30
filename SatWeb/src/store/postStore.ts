import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { Post } from "../../index";

axios.defaults.baseURL = `${import.meta.env.VITE_API_BASE_URL}`;

interface PostStore {
  posts: Post[];
  totalPublishedPosts: number;
  totalErrorPosts: number;
  addPost: (post: Post) => void;
  removePost: (postId: string) => void;
  getPost: () => Promise<void>;
  getPostedPosts: () => Promise<Post[] | void>;
  getErrorPosts: () => Promise<Post[] | void>;
  getProgress: (postTitle: string) => Promise<number | void>;
}

const postStore = create<PostStore>()(
  persist(
    (set, get) => ({
      posts: [],
      totalPublishedPosts: 0,
      totalErrorPosts: 0,

      addPost: (post) => set((state) => ({ posts: [...state.posts, post] })),

      removePost: (postId) =>
        set((state) => ({
          posts: state.posts.filter((post) => post._id !== postId),
        })),

      getPost: async () => {
        try {
          const res = await axios.get(`/api/post`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          });
          if (res.status === 200 && res.data?.allPosts) {
            set({ posts: res.data.allPosts });
          }
        } catch (error: any) {
          console.error(
            "Get post error:",
            error?.response?.data || error.message || error
          );
        }
      },

      getProgress: async (postTitle) => {
        try {
          const res = await axios.get(`/api/post/track-progress`, {
            params: { postTitle },
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          });
          return res.data.progress;
        } catch (error: any) {
          console.error(
            "Get progress error:",
            error?.response?.data || error.message || error
          );
        }
      },

      getPostedPosts: async () => {
        try {
          const res = await axios.get(`/api/satellite/published-posts`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          });
          if (res.status === 200) {
            set({ totalPublishedPosts: res.data.totalPublishedPosts });
            return res.data;
          }
        } catch (error: any) {
          console.error(
            "Get posted posts error:",
            error?.response?.data || error.message || error
          );
        }
      },

      getErrorPosts: async () => {
        try {
          const res = await axios.get(`/api/satellite/error-posts`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          });
          if (res.status === 200) {
            set({ totalErrorPosts: res.data.totalErrorPosts });
            return res.data;
          }
        } catch (error: any) {
          console.error(
            "Get error posts error:",
            error?.response?.data || error.message || error
          );
        }
      },
    }),
    {
      name: "post-storage",
      partialize: (state) => ({
        // chỉ lưu phần cần thiết
        posts: state.posts,
        totalPublishedPosts: state.totalPublishedPosts,
        totalErrorPosts: state.totalErrorPosts,
      }),
    }
  )
);

export default postStore;
