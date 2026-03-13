import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { hour: string; aqi: number }[];
}

export default function AqiChart({ data }: Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">AQI Trend (24h)</h3>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.slice(0, 24)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(210, 100%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(210, 100%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: 'hsl(215, 12%, 50%)' }}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(215, 12%, 50%)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(222, 25%, 12%)',
                border: '1px solid hsl(0, 0%, 100%, 0.1)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="hsl(210, 100%, 55%)"
              strokeWidth={2}
              fill="url(#aqiGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
