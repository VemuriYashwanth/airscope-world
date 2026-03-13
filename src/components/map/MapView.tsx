import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { useAppStore, CityData } from '@/store/useAppStore';
import { MOCK_CITIES } from '@/data/mockCities';
import { getAqiInfo, getMarkerSize } from '@/utils/aqi';

const DEFAULT_CENTER: [number, number] = [78.9629, 22.5937]; // India
const DEFAULT_ZOOM = 3.5;

/** Returns a scale factor for markers based on zoom level */
function getZoomScale(zoom: number): number {
  if (zoom <= 2) return 0.5;
  if (zoom <= 3) return 0.65;
  if (zoom <= 4) return 0.8;
  if (zoom <= 5) return 0.9;
  return 1;
}

// Module-level map reference for external access
let globalMapInstance: maplibregl.Map | null = null;

export function flyToWorldView() {
  if (globalMapInstance) {
    globalMapInstance.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 1500 });
  }
}

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const { setSelectedCity, isDarkMode, isHeatmapOn } = useAppStore();

  const createMarkerElement = useCallback((city: CityData) => {
    const info = getAqiInfo(city.aqi);
    const size = getMarkerSize(city.aqi);
    const diameter = size * 2;

    // Outer element is the MapLibre anchor — MapLibre sets transform on this
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      width: ${diameter}px;
      height: ${diameter}px;
      cursor: pointer;
    `;

    // Inner circle — hover effects go here (safe from MapLibre transforms)
    const circle = document.createElement('div');
    circle.className = 'aqi-marker';
    circle.style.cssText = `
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: ${info.color};
      border: 2px solid rgba(255,255,255,0.8);
      box-shadow: 0 0 ${size}px ${info.color}80, 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${Math.max(10, size - 4)}px;
      font-weight: 700;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      transform-origin: center center;
    `;
    circle.textContent = String(city.aqi);
    circle.setAttribute('data-tooltip', `${city.name} – ${info.label}`);

    wrapper.addEventListener('mouseenter', () => {
      circle.style.transform = 'scale(1.3)';
      circle.style.boxShadow = `0 0 ${size * 2}px ${info.color}, 0 4px 16px rgba(0,0,0,0.4)`;
    });
    wrapper.addEventListener('mouseleave', () => {
      circle.style.transform = 'scale(1)';
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

  const addMarkers = useCallback((map: maplibregl.Map) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    MOCK_CITIES.forEach((city) => {
      const el = createMarkerElement(city);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedCity(city);
        map.flyTo({ center: [city.lng, city.lat], zoom: 8, duration: 1500 });
      });
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([city.lng, city.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [createMarkerElement, setSelectedCity]);

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

    // No navigation controls — handled by custom UI

    map.on('load', () => {
      addCircleLayer(map);
      if (useAppStore.getState().isHeatmapOn) {
        map.setLayoutProperty('aqi-circle-layer', 'visibility', 'visible');
      }
    });

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

    // Track zoom for reset button
    map.on('zoomend', () => {
      useAppStore.getState().setIsZoomedIn(map.getZoom() > DEFAULT_ZOOM + 1);
    });

    mapRef.current = map;
    globalMapInstance = map;
    return () => { map.remove(); mapRef.current = null; globalMapInstance = null; };
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
