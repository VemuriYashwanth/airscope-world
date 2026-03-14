import { getAqiInfo } from '@/utils/aqi';

const AQI_TIERS = [
  { range: '0–50', aqi: 25 },
  { range: '51–100', aqi: 75 },
  { range: '101–150', aqi: 125 },
  { range: '151–200', aqi: 175 },
  { range: '201–300', aqi: 250 },
  { range: '300+', aqi: 350 },
];

export default function AqiLegend() {
  return (
    <div className="absolute bottom-4 right-4 z-10 glass-panel rounded-2xl px-3 py-2.5 hidden sm:block">
      <div className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
        AQI Scale
      </div>
      <div className="flex gap-1.5">
        {AQI_TIERS.map((tier) => {
          const info = getAqiInfo(tier.aqi);
          return (
            <div key={tier.range} className="flex flex-col items-center gap-0.5">
              <div
                className="w-5 h-5 rounded-md shadow-sm"
                style={{ background: info.color }}
              />
              <span className="text-[8px] text-muted-foreground leading-none whitespace-nowrap">
                {tier.range}
              </span>
              <span className="text-[7px] text-muted-foreground/70 leading-none whitespace-nowrap max-w-[48px] text-center truncate">
                {info.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
