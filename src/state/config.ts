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

  always_on_top: boolean;
  set_always_on_top: (always_on_top: boolean) => void;

  custom_launch_args: string;
  set_custom_launch_args: (custom_launch_args: string) => void;

  kill_fortnite_on_close: boolean;
  set_kill_fortnite_on_close: (kill_fortnite_on_close: boolean) => void;

  show_defender_popup: boolean;
  set_show_defender_popup: (show_defender_popup: boolean) => void;

  is_defender_excluded: boolean;
  set_is_defender_excluded: (is_defender_excluded: boolean) => void;
};

export const useConfigControl = create<ConfigState>()(
  persist(
    (set) => ({
      kill_fortnite_on_close: false,
      set_kill_fortnite_on_close: (kill_fortnite_on_close: boolean) =>
        set({ kill_fortnite_on_close }),
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
      always_on_top: false,
      set_always_on_top: (always_on_top: boolean) => set({ always_on_top }),
      custom_launch_args: "",
      set_custom_launch_args: (custom_launch_args: string) =>
        set({ custom_launch_args }),
      show_defender_popup: true,
      set_show_defender_popup: (show_defender_popup: boolean) =>
        set({ show_defender_popup }),
      is_defender_excluded: false,
      set_is_defender_excluded: (is_defender_excluded: boolean) =>
        set({ is_defender_excluded }),
    }),
    {
      name: "config.control",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
