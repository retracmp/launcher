import { queryClient } from "src/app/app";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UserControlState = {
  access_token: string;
  new_token: (access_token: string) => void;
  kill_token: () => void;
};

export const useUserControl = create<UserControlState>()(
  persist(
    (set) => ({
      access_token: "",
      new_token: async (access_token) => set({ access_token }),
      kill_token: () => {
        set({ access_token: "" });
        queryClient.setQueryData(["player"], null);
      },
    }),
    {
      name: "user.control",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
