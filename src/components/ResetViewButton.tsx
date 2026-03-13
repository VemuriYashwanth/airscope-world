import { Home } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { flyToWorldView } from '@/components/map/MapView';

export default function ResetViewButton() {
  const { isZoomedIn, resetView } = useAppStore();

  if (!isZoomedIn) return null;

  const handleReset = () => {
    resetView();
    flyToWorldView();
  };

  return (
    <button
      onClick={handleReset}
      className="absolute bottom-4 right-4 z-20 glass-panel p-3 rounded-2xl shadow-lg transition-all duration-300 hover:bg-secondary/50 animate-in fade-in slide-in-from-bottom-2"
      title="Reset to world view"
    >
      <Home className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}
