import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type point = {
  x: number;
  y: number;
};

type ConfigState = {
  bubble_builds: boolean;
  set_bubble_builds: (bubble_builds: boolean) => void;

  reset_on_release: boolean;
  set_reset_on_release: (edit_on_release: boolean) => void;

  disable_pre_edit: boolean;
  set_disable_pre_edit: (disable_pre_edit: boolean) => void;

  one_session: boolean;
  set_one_session: (one_session: boolean) => void;

  use_passwordless: boolean;
  set_use_passwordless: (dev: boolean) => void;

  raw_credentials: string;
  set_raw_credentials: (username: string) => void;

  use_localhost: boolean;
  set_use_localhost: (dev: boolean) => void;

  currentTheme: string;
  setTheme: (theme: string) => void;

  drawer_open: boolean;
  set_drawer_open: (drawer_open: boolean) => void;

  size: point;
  set_size: (size: point) => void;
};

export const useConfigControl = create<ConfigState>()(
  persist(
    (set) => ({
      bubble_builds: false,
      set_bubble_builds: (bubble_builds: boolean) => set({ bubble_builds }),
      reset_on_release: false,
      set_reset_on_release: (edit_on_release: boolean) =>
        set({ reset_on_release: edit_on_release }),
      disable_pre_edit: false,
      set_disable_pre_edit: (disable_pre_edit: boolean) =>
        set({ disable_pre_edit }),
      one_session: true,
      set_one_session: (one_session: boolean) => set({ one_session }),
      use_passwordless: false,
      set_use_passwordless: (dev: boolean) => set({ use_passwordless: dev }),
      raw_credentials: "",
      set_raw_credentials: (raw_credentials: string) =>
        set({ raw_credentials }),
      use_localhost: false,
      set_use_localhost: (dev: boolean) => set({ use_localhost: dev }),
      currentTheme: "theme1",
      setTheme: (theme: string) => set({ currentTheme: theme }),
      drawer_open: false,
      set_drawer_open: (drawer_open: boolean) => set({ drawer_open }),
      size: { x: 720, y: 530 },
      set_size: (size: point) => set({ size }),
    }),
    {
      name: "config.control",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
