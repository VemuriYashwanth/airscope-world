import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, Droplets, Sun, Thermometer, Radio } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getAqiInfo } from '@/utils/aqi';
import AqiChart from './AqiChart';

export default function CityPanel() {
  const { selectedCity, isPanelOpen, setIsPanelOpen, setSelectedCity } = useAppStore();

  const close = () => {
    setIsPanelOpen(false);
    setSelectedCity(null);
  };

  if (!selectedCity) return null;
  const info = getAqiInfo(selectedCity.aqi);

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Mobile: bottom sheet, Desktop: right panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-30 md:hidden max-h-[85vh] overflow-y-auto"
          >
            <PanelContent city={selectedCity} info={info} onClose={close} />
          </motion.div>

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-30 hidden md:block w-[400px] overflow-y-auto"
          >
            <PanelContent city={selectedCity} info={info} onClose={close} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PanelContent({ city, info, onClose }: { city: NonNullable<ReturnType<typeof useAppStore.getState>['selectedCity']>; info: ReturnType<typeof getAqiInfo>; onClose: () => void }) {
  const isLive = useAppStore((s) => s.isLiveData);
  return (
    <div className="glass-panel rounded-t-3xl md:rounded-none md:h-full p-6 space-y-6">
      {/* Drag handle mobile */}
      <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto md:hidden" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">{city.name}</h2>
            {isLive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{city.country}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* AQI Hero */}
      <div className="rounded-2xl p-5 text-center" style={{ background: `${info.color}20` }}>
        <div className="text-5xl font-black" style={{ color: info.color }}>
          {city.aqi}
        </div>
        <div className="text-sm font-semibold mt-1" style={{ color: info.color }}>
          {info.label}
        </div>
        <p className="text-xs text-muted-foreground mt-2 max-w-[280px] mx-auto">{info.advice}</p>
      </div>

      {/* Weather */}
      <div className="rounded-2xl bg-secondary/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl">{city.weatherIcon}</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{city.temperature}°C</div>
            <div className="text-xs text-muted-foreground">{city.weatherDescription}</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <WeatherStat icon={<Wind className="w-3.5 h-3.5" />} label="Wind" value={`${city.windSpeed} km/h`} />
          <WeatherStat icon={<Droplets className="w-3.5 h-3.5" />} label="Humidity" value={`${city.humidity}%`} />
          <WeatherStat icon={<Sun className="w-3.5 h-3.5" />} label="UV" value={String(city.uvIndex)} />
          <WeatherStat icon={<Thermometer className="w-3.5 h-3.5" />} label="Feels" value={`${city.temperature + 2}°`} />
        </div>
      </div>

      {/* Pollutants */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Pollution Breakdown</h3>
        <div className="grid grid-cols-3 gap-2">
          <PollutantCard name="PM2.5" value={city.pm25} unit="µg/m³" />
          <PollutantCard name="PM10" value={city.pm10} unit="µg/m³" />
          <PollutantCard name="CO" value={city.co} unit="mg/m³" />
          <PollutantCard name="NO₂" value={city.no2} unit="µg/m³" />
          <PollutantCard name="O₃" value={city.o3} unit="µg/m³" />
        </div>
      </div>

      {/* Hourly Forecast */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Hourly Forecast</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {city.hourlyForecast.slice(0, 12).map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-1 min-w-[48px]">
              <span className="text-xs text-muted-foreground">{h.hour}</span>
              <span className="text-lg">{h.icon}</span>
              <span className="text-xs font-medium text-foreground">{h.temp}°</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">7-Day Forecast</h3>
        <div className="space-y-2">
          {city.dailyForecast.map((d, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
              <span className="text-sm text-foreground w-10">{d.day}</span>
              <span className="text-lg">{d.icon}</span>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{d.low}°</span>
                <div className="w-16 h-1 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${((d.high - d.low) / 40) * 100}%` }} />
                </div>
                <span className="text-foreground font-medium">{d.high}°</span>
              </div>
              <AqiBadge aqi={d.aqi} />
            </div>
          ))}
        </div>
      </div>

      {/* AQI Chart */}
      <AqiChart data={city.hourlyForecast} />
    </div>
  );
}

function WeatherStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2 rounded-xl bg-background/50">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}

function PollutantCard({ name, value, unit }: { name: string; value: number; unit: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3 text-center">
      <div className="text-xs text-muted-foreground">{name}</div>
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{unit}</div>
    </div>
  );
}

function AqiBadge({ aqi }: { aqi: number }) {
  const info = getAqiInfo(aqi);
  return (
    <div className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${info.color}20`, color: info.color }}>
      {aqi}
    </div>
  );
}
