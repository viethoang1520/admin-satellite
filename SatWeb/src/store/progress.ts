import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProgressState {
  status: string;
  message: string;
  percent: number;
  newPost: any | null;
  satelliteUrls: string[];
  setProgress: (data: Partial<ProgressState>) => void;
  resetProgress: () => void;
}

const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      status: "",
      message: "",
      percent: 0,
      newPost: null,
      satelliteUrls: [],
      setProgress: (data) => set((state) => ({ ...state, ...data })),
      resetProgress: () =>
        set({
          status: "",
          message: "",
          percent: 0,
          newPost: null,
          satelliteUrls: [],
        }),
    }),
    {
      name: "progress-storage", // tên key trong localStorage
    }
  )
);

export default useProgressStore;
