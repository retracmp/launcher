import { create } from "zustand";

type NewsState = {
  selected: int;
  set_selected: (x: int) => void;
};

export const useNewsState = create<NewsState>((set) => ({
  selected: 0,
  set_selected: (x: int) =>
    set({
      selected: x,
    }),
}));
