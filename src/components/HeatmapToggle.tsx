import { Layers } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function HeatmapToggle() {
  const { isHeatmapOn, toggleHeatmap } = useAppStore();

  return (
    <button
      onClick={toggleHeatmap}
      className={`absolute top-4 right-16 z-20 glass-panel p-3 rounded-2xl shadow-lg transition-all duration-200 ${
        isHeatmapOn
          ? 'ring-2 ring-primary bg-primary/10'
          : 'hover:bg-secondary/50'
      }`}
      title={isHeatmapOn ? 'Hide AQI Heatmap' : 'Show AQI Heatmap'}
    >
      <Layers className={`w-5 h-5 ${isHeatmapOn ? 'text-primary' : 'text-muted-foreground'}`} />
    </button>
  );
}
