import { create } from 'zustand';

export interface CityData {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  aqi: number;
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  o3: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  uvIndex: number;
  weatherIcon: string;
  weatherDescription: string;
  hourlyForecast: { hour: string; temp: number; aqi: number; icon: string }[];
  dailyForecast: { day: string; high: number; low: number; aqi: number; icon: string }[];
}

interface AppState {
  selectedCity: CityData | null;
  searchQuery: string;
  isPanelOpen: boolean;
  isDarkMode: boolean;
  isHeatmapOn: boolean;
  setSelectedCity: (city: CityData | null) => void;
  setSearchQuery: (query: string) => void;
  setIsPanelOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  toggleHeatmap: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedCity: null,
  searchQuery: '',
  isPanelOpen: false,
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  isHeatmapOn: false,
  setSelectedCity: (city) => set({ selectedCity: city, isPanelOpen: !!city }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsPanelOpen: (open) => set({ isPanelOpen: open }),
  toggleDarkMode: () => set((state) => {
    const next = !state.isDarkMode;
    document.documentElement.classList.toggle('dark', next);
    return { isDarkMode: next };
  }),
  toggleHeatmap: () => set((state) => ({ isHeatmapOn: !state.isHeatmapOn })),
}));
