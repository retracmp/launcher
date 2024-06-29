import { create } from "zustand";

type EVENTS = {
  fortnite_process_id: (pid: number) => void;
  download_progress: (progress: DownloadProgress_rust) => void;
};

type EventsState = {
  actions: Map<keyof EVENTS, Array<EVENTS[keyof EVENTS]>>;
  subscribe: <T extends keyof EVENTS>(event: T, callback: EVENTS[T]) => void;
  unsubscribe: <T extends keyof EVENTS>(event: T, callback: EVENTS[T]) => void;
  get: <T extends keyof EVENTS>(event: T) => Array<EVENTS[T]>;
};

export const useEvents = create<EventsState>((set, get) => ({
  actions: new Map(),
  subscribe: (event, callback) => {
    const existingActions = get().actions;
    if (!existingActions) return;

    const existing = existingActions.get(event);
    if (!existing) existingActions.set(event, [callback]);
    if (existing) {
      existing.push(callback);
      existingActions.set(event, existing);
    }

    set({ actions: existingActions });
  },
  unsubscribe: (event, callback) => {
    const existingActions = get().actions;
    if (!existingActions) return;

    const existing = existingActions.get(event);
    if (!existing) return;

    const newActions = existing.filter((cb) => cb !== callback);
    existingActions.set(event, newActions);

    set({ actions: existingActions });
  },
  get: (event) => {
    const existingActions = get().actions;
    if (!existingActions) return [];

    const existing = existingActions.get(event);
    if (!existing) return [];

    return existing as any; // sorry types
  },
}));
