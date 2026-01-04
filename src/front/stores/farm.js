// src/front/stores/farm.js
import { create } from 'zustand';

export const useFarmStore = create((set) => ({
    currentFarm: null,
    setCurrentFarm: (farm) => set({ currentFarm: farm }),
    clearFarm: () => set({ currentFarm: null }),
}));