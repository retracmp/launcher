import client from "src/external/client";
import { create } from "zustand";

type RetracApiState = {
  retrac_items: Record<string, FortniteApiResult>;
  load: () => Promise<void>;
  find: (id: string) => FortniteApiResult | null;
};

export const useRetracApi = create<RetracApiState>((set, get) => ({
  retrac_items: {},
  load: async () => {
    const items = await client.retrac_items();
    console.log(items);
    set({ retrac_items: items });
  },
  find: (id: string) => {
    return get().retrac_items[id] || null;
  },
}));
