// WAQI (World Air Quality Index) API Service
// Demo token for testing — get your own at https://aqicn.org/data-platform/token/
const WAQI_TOKEN = 'demo';

export interface WaqiStation {
  uid: number;
  aqi: string;
  lat: number;
  lon: number;
  station: { name: string; time: string };
}

export interface WaqiStationDetail {
  aqi: number;
  idx: number;
  city: { name: string; geo: [number, number]; url: string };
  iaqi: Record<string, { v: number }>;
  time: { s: string };
}

export async function fetchStationsInBounds(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): Promise<WaqiStation[]> {
  const res = await fetch(
    `https://api.waqi.info/v2/map/bounds/?latlng=${lat1},${lng1},${lat2},${lng2}&networks=all&token=${WAQI_TOKEN}`
  );
  const data = await res.json();
  if (data.status !== 'ok') throw new Error(data.data || 'WAQI API error');
  return (data.data as WaqiStation[]).filter(
    (s) => s.aqi !== '-' && !isNaN(parseInt(s.aqi))
  );
}

export async function fetchStationDetail(
  uid: number
): Promise<WaqiStationDetail> {
  const res = await fetch(
    `https://api.waqi.info/feed/@${uid}/?token=${WAQI_TOKEN}`
  );
  const data = await res.json();
  if (data.status !== 'ok') throw new Error(data.data || 'WAQI API error');
  return data.data;
}

export async function searchStations(
  keyword: string
): Promise<
  {
    uid: number;
    aqi: string;
    station: { name: string; geo: [number, number] };
    time: { stime: string };
  }[]
> {
  const res = await fetch(
    `https://api.waqi.info/search/?keyword=${encodeURIComponent(keyword)}&token=${WAQI_TOKEN}`
  );
  const data = await res.json();
  if (data.status !== 'ok') throw new Error(data.data || 'WAQI API error');
  return data.data;
}
