import { create } from "zustand";
import axios from "axios";
import { Post } from "../../index";
axios.defaults.baseURL = `${import.meta.env.VITE_API_BASE_URL}`;

interface postStore {
  posts: Post[];
  totalPublishedPosts: number;
  totalErrorPosts: number;
  addPost: (post: Post) => void;
  removePost: (postId: string) => void;
  getPost: () => void;
  getPostedPosts: () => Promise<Post[]>;
  getErrorPosts: () => Promise<Post[]>;
  getProgress: (postTitle: string) => Promise<number>;
}

const postStore = create<postStore>((set) => ({
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
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      if (res.status === 200) {
        const post = res.data;
        set({ posts: res.data.allPosts });
      }
    } catch (error) {
      console.error(
        "Get post error",
        error?.response?.data || error.message || error
      );
    }
  },
  getProgress: async (postTitle) => {
    try {
      const res = await axios.get(`/api/post/track-progress`, {
        params: { postTitle },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return res.data.progress;
    } catch (error) {
      console.error(
        "Get progress error",
        error?.response?.data || error.message || error
      );
    }
  },
  getPostedPosts: async () => {
    try {
      const res = await axios.get(`/api/satellite/published-posts`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      if (res.status === 200) {
        const postedPosts = res.data;
        set({ totalPublishedPosts: res.data.totalPublishedPosts });
        return postedPosts;
      }
    } catch (error) {
      console.error(
        "Get progress error",
        error?.response?.data || error.message || error
      );
    }
  },
  getErrorPosts: async () => {
    try {
      const res = await axios.get(`/api/satellite/error-posts`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      if (res.status === 200) {
        const errorPosts = res.data;
        set({ totalErrorPosts: res.data.totalErrorPosts });
        return errorPosts;
      }
    } catch (error) {
      console.error(
        "Get progress error",
        error?.response?.data || error.message || error
      );
    }
  },
}));

export default postStore;
