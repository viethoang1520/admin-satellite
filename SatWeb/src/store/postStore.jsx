import { create } from "zustand";
import axios from "axios";
axios.defaults.baseURL = ${import.meta.env.VITE_API_BASE_URL};
const postStore = create((set) => ({
  posts: [],
  addPost: (post) => set((state) => ({ posts: [...state.posts, post] })),
  removePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
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
    console.log("Getting progress...", postTitle);
    try {
      const res = await axios.get(`/api/post/track-progress`, {
        params: { postTitle },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      console.log("Progress:", res);
      return res.data.progress;
    } catch (error) {
      console.error(
        "Get progress error",
        error?.response?.data || error.message || error
      );
    }
  },
}));

export default postStore;
