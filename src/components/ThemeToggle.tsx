import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useAppStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="absolute top-4 right-4 z-20 glass-panel w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform text-foreground"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
