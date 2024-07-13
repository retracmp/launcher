import client from "src/external/client";
import { create } from "zustand";

type RetracApiState = {
  retrac_items: Record<string, FortniteApiResult>;
  load: () => Promise<void>;
  find: (id: string) => FortniteApiResult | null;
  find_all_by_type: (type: string) => FortniteApiResult[];
  find_all_by_set: (set: string) => FortniteApiResult[];
  find_all_by_name: (name: string) => FortniteApiResult[];
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
  find_all_by_type: (type: string) => {
    return Object.values(get().retrac_items).filter(
      (item) =>
        item.type.value.includes(type) ||
        item.type.displayValue.includes(type) ||
        item.type.backendValue.includes(type)
    );
  },
  find_all_by_set: (set: string) => {
    return Object.values(get().retrac_items).filter(
      (item) =>
        item.set.value.includes(set) ||
        item.set.text.includes(set) ||
        item.set.backendValue.includes(set)
    );
  },
  find_all_by_name: (name: string) => {
    return Object.values(get().retrac_items).filter(
      (item) =>
        item.name.toLowerCase().includes(name.toLowerCase()) ||
        item.id.toLowerCase().includes(name.toLowerCase())
    );
  },
}));
