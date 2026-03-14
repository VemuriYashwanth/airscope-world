import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { useAppStore, CityData } from '@/store/useAppStore';
import { MOCK_CITIES } from '@/data/mockCities';
import { getAqiInfo, getMarkerSize } from '@/utils/aqi';
import { fetchStationsInBounds, fetchStationDetail, type WaqiStation } from '@/services/aqiApi';

const DEFAULT_CENTER: [number, number] = [78.9629, 22.5937]; // India
const DEFAULT_ZOOM = 3.5;

/** Returns a scale factor for markers based on zoom level */
function getZoomScale(zoom: number): number {
  if (zoom <= 2) return 0.35;
  if (zoom <= 3) return 0.5;
  if (zoom <= 3.5) return 0.6;
  if (zoom <= 4) return 0.7;
  if (zoom <= 5) return 0.8;
  if (zoom <= 6) return 0.9;
  return 1;
}

// Module-level map reference for external access
let globalMapInstance: maplibregl.Map | null = null;

export function flyToWorldView() {
  if (globalMapInstance) {
    globalMapInstance.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 1500 });
  }
}

export function flyToCity(lng: number, lat: number) {
  if (globalMapInstance) {
    globalMapInstance.flyTo({ center: [lng, lat], zoom: 8, duration: 1500 });
  }
}

/** Convert WAQI station to CityData for marker display */
function waqiToCityData(station: WaqiStation): CityData {
  const aqi = parseInt(station.aqi) || 0;
  // Extract a readable city name from the station name
  const name = station.station.name.split(',')[0].replace(/\(.+\)/, '').trim();
  return {
    id: `live-${station.uid}`,
    name,
    country: station.station.name.includes(',') ? station.station.name.split(',').pop()?.trim() || '' : '',
    lat: station.lat,
    lng: station.lon,
    aqi,
    pm25: 0, pm10: 0, co: 0, no2: 0, o3: 0,
    temperature: 0, humidity: 0, windSpeed: 0,
    windDirection: '', uvIndex: 0,
    weatherIcon: '', weatherDescription: '',
    hourlyForecast: [], dailyForecast: [],
  };
}

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setSelectedCity, isDarkMode, isHeatmapOn } = useAppStore();

  const createMarkerElement = useCallback((city: CityData) => {
    const info = getAqiInfo(city.aqi);
    const size = getMarkerSize(city.aqi);
    const diameter = size * 2;
    const isLive = city.id.startsWith('live-');

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      width: ${diameter}px;
      height: ${diameter}px;
      cursor: pointer;
    `;

    const circle = document.createElement('div');
    circle.className = 'aqi-marker';
    circle.dataset.zoomScale = '1';
    circle.dataset.hovered = '0';
    circle.style.cssText = `
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: ${info.color};
      border: 2px solid ${isLive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)'};
      box-shadow: 0 0 ${size}px ${info.color}80, 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${Math.max(10, size - 4)}px;
      font-weight: 700;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      transform-origin: center center;
    `;
    circle.textContent = String(city.aqi);
    circle.setAttribute('data-tooltip', `${city.name} – ${info.label}`);

    const applyScale = () => {
      const zs = parseFloat(circle.dataset.zoomScale || '1');
      const hs = circle.dataset.hovered === '1' ? 1.3 : 1;
      circle.style.transform = `scale(${zs * hs})`;
    };

    wrapper.addEventListener('mouseenter', () => {
      circle.dataset.hovered = '1';
      applyScale();
      circle.style.boxShadow = `0 0 ${size * 2}px ${info.color}, 0 4px 16px rgba(0,0,0,0.4)`;
    });
    wrapper.addEventListener('mouseleave', () => {
      circle.dataset.hovered = '0';
      applyScale();
      circle.style.boxShadow = `0 0 ${size}px ${info.color}80, 0 2px 8px rgba(0,0,0,0.3)`;
    });

    wrapper.appendChild(circle);
    return wrapper;
  }, []);

  const findNearestCity = useCallback((lng: number, lat: number, maxDistKm = 200): CityData | null => {
    let nearest: CityData | null = null;
    let minDist = Infinity;
    for (const city of MOCK_CITIES) {
      const dlat = (city.lat - lat) * 111;
      const dlng = (city.lng - lng) * 111 * Math.cos(lat * Math.PI / 180);
      const dist = Math.sqrt(dlat * dlat + dlng * dlng);
      if (dist < minDist && dist < maxDistKm) {
        minDist = dist;
        nearest = city;
      }
    }
    return nearest;
  }, []);

  const addCircleLayer = useCallback((map: maplibregl.Map) => {
    if (map.getSource('aqi-circles')) return;

    map.addSource('aqi-circles', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: MOCK_CITIES.map(c => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
          properties: { aqi: c.aqi },
        })),
      },
    });

    map.addLayer({
      id: 'aqi-circle-layer',
      type: 'circle',
      source: 'aqi-circles',
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          1, ['interpolate', ['linear'], ['get', 'aqi'], 0, 30, 100, 50, 200, 70, 300, 90],
          5, ['interpolate', ['linear'], ['get', 'aqi'], 0, 50, 100, 80, 200, 110, 300, 140],
          10, ['interpolate', ['linear'], ['get', 'aqi'], 0, 60, 100, 100, 200, 140, 300, 180],
        ],
        'circle-color': [
          'interpolate', ['linear'], ['get', 'aqi'],
          0, 'hsl(142, 72%, 45%)',
          50, 'hsl(142, 72%, 45%)',
          51, 'hsl(45, 100%, 51%)',
          100, 'hsl(45, 100%, 51%)',
          101, 'hsl(30, 100%, 50%)',
          150, 'hsl(30, 100%, 50%)',
          151, 'hsl(0, 80%, 55%)',
          200, 'hsl(0, 80%, 55%)',
          201, 'hsl(280, 60%, 45%)',
          300, 'hsl(280, 60%, 45%)',
          301, 'hsl(0, 60%, 30%)',
        ],
        'circle-opacity': 0.45,
        'circle-blur': 0.7,
      },
    });
  }, []);

  // Toggle circle layer visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const toggle = () => {
      try {
        if (map.getLayer('aqi-circle-layer')) {
          map.setLayoutProperty('aqi-circle-layer', 'visibility', isHeatmapOn ? 'visible' : 'none');
        }
      } catch (err) {
        console.error('Failed to toggle circle layer:', err);
      }
    };

    if (map.isStyleLoaded()) toggle();
    else map.once('load', toggle);
  }, [isHeatmapOn]);

  const addMarkers = useCallback((map: maplibregl.Map, cities: CityData[] = MOCK_CITIES) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    cities.forEach((city) => {
      const el = createMarkerElement(city);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        // For live stations, fetch detail data before showing panel
        if (city.id.startsWith('live-')) {
          const uid = parseInt(city.id.replace('live-', ''));
          setSelectedCity(city);
          useAppStore.getState().setIsLiveData(true);
          map.flyTo({ center: [city.lng, city.lat], zoom: 8, duration: 1500 });
          // Fetch detail in background and update
          fetchStationDetail(uid).then((detail) => {
            const enriched: CityData = {
              ...city,
              aqi: detail.aqi,
              pm25: detail.iaqi?.pm25?.v ?? 0,
              pm10: detail.iaqi?.pm10?.v ?? 0,
              co: detail.iaqi?.co?.v ?? 0,
              no2: detail.iaqi?.no2?.v ?? 0,
              o3: detail.iaqi?.o3?.v ?? 0,
              temperature: detail.iaqi?.t?.v ?? 0,
              humidity: detail.iaqi?.h?.v ?? 0,
              windSpeed: detail.iaqi?.w?.v ?? 0,
            };
            useAppStore.getState().setSelectedCity(enriched);
          }).catch(console.error);
        } else {
          useAppStore.getState().setIsLiveData(false);
          setSelectedCity(city);
          map.flyTo({ center: [city.lng, city.lat], zoom: 8, duration: 1500 });
        }
      });
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([city.lng, city.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [createMarkerElement, setSelectedCity]);

  // Fetch live stations for current map bounds
  const fetchLiveData = useCallback((map: maplibregl.Map) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const stations = await fetchStationsInBounds(sw.lat, sw.lng, ne.lat, ne.lng);
        if (stations.length > 0) {
          const liveCities = stations.map(waqiToCityData);
          addMarkers(map, liveCities);
          useAppStore.getState().setIsLiveData(true);
          // Update zoom scale for new markers
          const scale = getZoomScale(map.getZoom());
          markersRef.current.forEach(m => {
            const circle = m.getElement().querySelector('.aqi-marker') as HTMLElement;
            if (circle) {
              circle.dataset.zoomScale = String(scale);
              circle.style.transform = `scale(${scale})`;
            }
          });
        }
      } catch (err) {
        console.warn('Live AQI fetch failed, using mock data:', err);
        // Keep existing markers (mock data)
      }
    }, 2000);
  }, [addMarkers]);

  // Map init
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://basemaps.cartocdn.com/gl/${isDarkMode ? 'dark-matter-gl-style' : 'positron-gl-style'}/style.json`,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: 0,
      maxZoom: 14,
      minZoom: 1.5,
    });

    map.on('load', () => {
      addCircleLayer(map);
      if (useAppStore.getState().isHeatmapOn) {
        map.setLayoutProperty('aqi-circle-layer', 'visibility', 'visible');
      }
      // Try to load live data on initial load
      fetchLiveData(map);
    });

    // Start with mock markers as fallback
    addMarkers(map);

    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point);
      const placeFeature = features.find(f =>
        f.layer?.id?.includes('place') ||
        f.layer?.id?.includes('city') ||
        f.layer?.id?.includes('town') ||
        f.layer?.id?.includes('label') ||
        f.layer?.id?.includes('poi')
      );
      if (placeFeature) {
        const nearest = findNearestCity(e.lngLat.lng, e.lngLat.lat, 300);
        if (nearest) {
          setSelectedCity(nearest);
          map.flyTo({ center: [nearest.lng, nearest.lat], zoom: 8, duration: 1500 });
        }
      }
    });

    map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point);
      const isPlace = features.some(f =>
        f.layer?.id?.includes('place') ||
        f.layer?.id?.includes('city') ||
        f.layer?.id?.includes('town') ||
        f.layer?.id?.includes('label')
      );
      map.getCanvas().style.cursor = isPlace ? 'pointer' : '';
    });

    // Scale inner circles on zoom
    const updateMarkerScale = () => {
      const scale = getZoomScale(map.getZoom());
      markersRef.current.forEach(m => {
        const circle = m.getElement().querySelector('.aqi-marker') as HTMLElement;
        if (circle) {
          circle.dataset.zoomScale = String(scale);
          const hs = circle.dataset.hovered === '1' ? 1.3 : 1;
          circle.style.transform = `scale(${scale * hs})`;
        }
      });
    };
    map.on('zoom', updateMarkerScale);
    updateMarkerScale();

    // Track zoom for reset button
    map.on('zoomend', () => {
      useAppStore.getState().setIsZoomedIn(map.getZoom() > DEFAULT_ZOOM + 1);
    });

    // Fetch live data when user pans/zooms
    map.on('moveend', () => {
      fetchLiveData(map);
    });

    mapRef.current = map;
    globalMapInstance = map;
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      map.remove();
      mapRef.current = null;
      globalMapInstance = null;
    };
  }, []);

  // Dark mode style swap
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const style = `https://basemaps.cartocdn.com/gl/${isDarkMode ? 'dark-matter-gl-style' : 'positron-gl-style'}/style.json`;
    map.setStyle(style);
    map.once('style.load', () => {
      addCircleLayer(map);
      if (useAppStore.getState().isHeatmapOn) {
        map.setLayoutProperty('aqi-circle-layer', 'visibility', 'visible');
      }
      addMarkers(map);
    });
  }, [isDarkMode, addMarkers, addCircleLayer]);

  return <div ref={mapContainer} className="absolute inset-0 w-full h-full" />;
}
