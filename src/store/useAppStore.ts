import { create } from 'zustand';

interface AppStoreState {
  selectedCoinId: string;
  setSelectedCoinId: (coinId: string) => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  selectedCoinId: '',
  setSelectedCoinId: (coinId) => set({ selectedCoinId: coinId }),
}));
