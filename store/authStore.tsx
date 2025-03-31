import { create } from "zustand";

interface AuthState {
  username: string | null;
  fetchUsername: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  username: null,
  fetchUsername: async () => {
    try {
      const response = await fetch(`${process.env.ORIGIN_URL}/returnUsername`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        set({ username: data.username });
      } else {
        console.error("Failed to fetch username");
      }
    } catch (error) {
      console.error("An error occurred while fetching the username:", error);
    }
  },
}));