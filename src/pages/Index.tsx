import { useEffect } from 'react';
import MapView from '@/components/map/MapView';
import CitySearch from '@/components/CitySearch';
import CityPanel from '@/components/CityPanel';
import ThemeToggle from '@/components/ThemeToggle';
import HeatmapToggle from '@/components/HeatmapToggle';
import ResetViewButton from '@/components/ResetViewButton';
import AqiLegend from '@/components/AqiLegend';
import { useAppStore } from '@/store/useAppStore';

export default function Index() {
  const { isDarkMode } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <MapView />
      <CitySearch />
      <HeatmapToggle />
      <ThemeToggle />
      <CityPanel />
      <ResetViewButton />

      {/* Branding */}
      <div className="absolute bottom-4 left-4 z-10 glass-panel px-4 py-2 rounded-2xl">
        <span className="text-sm font-bold text-foreground">🌍 AirScope</span>
        <span className="text-xs text-muted-foreground ml-2">Global AQI Intelligence</span>
      </div>
    </div>
  );
}
