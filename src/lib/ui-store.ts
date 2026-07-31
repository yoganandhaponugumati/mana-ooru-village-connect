import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIStore = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  triggerHaptic: (type?: "light" | "medium" | "heavy") => void;
  offlineQueue: any[];
  addToOfflineQueue: (item: any) => void;
  clearOfflineQueue: () => void;
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.isDarkMode;
          if (next) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { isDarkMode: next };
        }),
      triggerHaptic: (type = "light") => {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          if (type === "light") navigator.vibrate(10);
          if (type === "medium") navigator.vibrate(30);
          if (type === "heavy") navigator.vibrate(50);
        }
      },
      offlineQueue: [],
      addToOfflineQueue: (item) =>
        set((state) => ({ offlineQueue: [...state.offlineQueue, item] })),
      clearOfflineQueue: () => set({ offlineQueue: [] }),
    }),
    {
      name: "village-ui-storage",
      onRehydrateStorage: () => (state) => {
        if (state?.isDarkMode) {
          document.documentElement.classList.add("dark");
        }
      },
    }
  )
);
