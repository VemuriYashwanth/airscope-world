

# Plan: Real-time AQI Data, Search Fly-to, and AQI Color Legend

## 1. Real-time AQI Data (WAQI API)

Replace mock data with live data from the **WAQI (World Air Quality Index)** public API. This API provides real-time AQI, pollutant breakdown, and weather data for cities worldwide.

- The WAQI API has a free tier with a public token. We'll need an API token (it's a publishable key, safe to store in code).
- Create a new `src/hooks/useAqiData.ts` hook that fetches data from WAQI's `feed` and `search` endpoints.
- Update `CityData` interface to accommodate real API response fields.
- On app load, fetch AQI data for all major cities using the WAQI geo-bounded feed endpoint (`/map/bounds/`), which returns stations within map bounds.
- Keep `MOCK_CITIES` as fallback coordinates/metadata, but overlay real AQI values when available.
- Add a loading state and error handling (fall back to mock data if API fails).

**API endpoints:**
- Search: `https://api.waqi.info/search/?keyword={city}&token={token}`
- City feed: `https://api.waqi.info/feed/@{stationId}/?token={token}`
- Map bounds: `https://api.waqi.info/v2/map/bounds/?latlng={lat1},{lng1},{lat2},{lng2}&token={token}`

**Files to create/edit:**
- Create `src/hooks/useAqiData.ts` — fetch + cache logic
- Edit `src/data/mockCities.ts` — keep as fallback, add station IDs where known
- Edit `src/components/map/MapView.tsx` — use live data for markers
- Edit `src/components/CityPanel.tsx` — show "Live" badge when using real data
- Edit `src/components/CitySearch.tsx` — search against live API too

## 2. Search Fly-to

When a user selects a city from the search dropdown, fly the map to that city's coordinates.

- Export the `globalMapInstance` flyTo from `MapView.tsx` (already have `flyToWorldView`).
- Add a new exported function `flyToCity(lng, lat)` in `MapView.tsx`.
- In `CitySearch.tsx`, import and call `flyToCity` inside `handleSelect` after `setSelectedCity`.

**Files to edit:**
- `src/components/map/MapView.tsx` — add `flyToCity` export
- `src/components/CitySearch.tsx` — call `flyToCity` on selection

## 3. AQI Color Legend

Add a small, compact legend overlay in the bottom-right corner of the map showing the 6 AQI tiers with their colors and labels.

- Create `src/components/AqiLegend.tsx` — a glass-panel styled horizontal/vertical strip.
- Show color swatches with labels: Good, Moderate, Unhealthy for Sensitive, Unhealthy, Very Unhealthy, Hazardous.
- Position it `absolute bottom-4 right-4` (or bottom-4 left-1/2 centered).
- Responsive: compact on mobile.

**Files to create/edit:**
- Create `src/components/AqiLegend.tsx`
- Edit `src/pages/Index.tsx` — add the legend component

## Technical Notes

- The WAQI API token is a **publishable** key (used client-side on their own website), so it's safe to store directly in code.
- The map bounds endpoint returns all stations in the visible area — we can call it on map `moveend` to dynamically load stations as the user pans.
- We'll debounce the bounds fetch to avoid excessive API calls.
- Real data replaces `aqi`, `pm25`, `pm10`, `co`, `no2`, `o3`, `temperature`, `humidity`, `windSpeed` fields. Forecast data stays mock for now (WAQI free tier doesn't include forecasts).

