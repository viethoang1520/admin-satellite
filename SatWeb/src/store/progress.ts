import { create } from "zustand";
type Post = {
  id: string;
  title: string;
  content: string;
  totalSatellite: number;
  postedSatellite: string[];
  errorSatellite: string[];
  successfulRate: number;
};
interface ProgressState {
  status: "idle" | "in-progress" | "success" | "error";
  message: string;
  percent: number;
  newPost?: Post;
  satelliteUrls?: string[];
  setProgress: (data: Partial<ProgressState>) => void;
  reset: () => void;
}

const useProgressStore = create<ProgressState>((set) => ({
  status: "idle",
  message: "",
  percent: 0,
  newPost: undefined,
  satelliteUrls: undefined,
  setProgress: (data) => set((state) => ({ ...state, ...data })),
  reset: () =>
    set({
      status: "idle",
      message: "",
      percent: 0,
      newPost: undefined,
      satelliteUrls: undefined,
    }),
}));

export default useProgressStore;
