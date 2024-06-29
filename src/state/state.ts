import { create } from "zustand";

type StateState = {
  states: Record<string, string>;
  set_state: (id: string, active: string) => void;

  settings_page_active: boolean;
  set_settings_page_active: (
    active: boolean | ((prev: boolean) => boolean)
  ) => void;

  is_downloading: boolean;
  set_downloading: (active: boolean | ((prev: boolean) => boolean)) => void;
};

export const LOADING_STATES = {
  LOADING: "loading",
  ALREADY_ACTIVE: "already_active",
  ERROR: "not_ok",
  AWAITING_ACTION: "ok",

  ATTEMPTING_LOGIN: "attempting_login",
  FETCHING_BUILD: "fetching_build",
  STARTING_PROCESS: "starting_process",
  INGAME: "in_game",
};

export const useStates = create<StateState>((set) => ({
  states: {
    importing: LOADING_STATES.AWAITING_ACTION,
    launching: LOADING_STATES.AWAITING_ACTION,
  } as Record<string, string>,
  set_state: (loader, active) => {
    set((state) => ({
      states: {
        ...state.states,
        [loader]: active,
      },
    }));
  },
  settings_page_active: false,
  set_settings_page_active: (active) => {
    if (typeof active === "function") {
      set((state) => ({
        settings_page_active: active(state.settings_page_active),
      }));
      return;
    }

    set({ settings_page_active: active });
  },
  is_downloading: false,
  set_downloading: (active) => {
    if (typeof active === "function") {
      set((state) => ({
        is_downloading: active(state.is_downloading),
      }));
      return;
    }

    set({ is_downloading: active });
  },
}));
