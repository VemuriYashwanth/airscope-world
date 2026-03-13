import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { useAppStore, CityData } from '@/store/useAppStore';
import { MOCK_CITIES } from '@/data/mockCities';
import { getAqiInfo, getMarkerSize } from '@/utils/aqi';

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const { setSelectedCity, isDarkMode, isHeatmapOn } = useAppStore();

  const createMarkerElement = useCallback((city: CityData) => {
    const info = getAqiInfo(city.aqi);
    const size = getMarkerSize(city.aqi);
    
    // Outer wrapper with fixed size to prevent layout shifts on hover
    const wrapper = document.createElement('div');
    const wrapperSize = size * 3;
    wrapper.style.cssText = `
      width: ${wrapperSize}px;
      height: ${wrapperSize}px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
    `;

    const el = document.createElement('div');
    el.className = 'aqi-marker';
    el.style.cssText = `
      width: ${size * 2}px;
      height: ${size * 2}px;
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
    el.textContent = String(city.aqi);

    wrapper.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.3)';
      el.style.boxShadow = `0 0 ${size * 2}px ${info.color}, 0 4px 16px rgba(0,0,0,0.4)`;
      tooltip.style.opacity = '1';
    });
    wrapper.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.boxShadow = `0 0 ${size}px ${info.color}80, 0 2px 8px rgba(0,0,0,0.3)`;
      tooltip.style.opacity = '0';
    });

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
      position: absolute;
      bottom: calc(100%);
      left: 50%;
      transform: translateX(-50%);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      background: rgba(0,0,0,0.8);
      color: white;
      backdrop-filter: blur(8px);
      z-index: 10;
    `;
    tooltip.textContent = `${city.name} – ${info.label}`;

    wrapper.appendChild(el);
    wrapper.appendChild(tooltip);
    return wrapper;
  }, []);

  // Heatmap layer management
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyHeatmap = () => {
      // Remove existing heatmap
      if (map.getLayer('aqi-heat')) map.removeLayer('aqi-heat');
      if (map.getSource('aqi-points')) map.removeSource('aqi-points');

      if (!isHeatmapOn) return;

      map.addSource('aqi-points', {
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
        id: 'aqi-heat',
        type: 'heatmap',
        source: 'aqi-points',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'aqi'], 0, 0, 300, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.6, 9, 3],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 30, 9, 60],
          'heatmap-opacity': 0.6,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.1, '#00e400',
            0.3, '#ffff00',
            0.5, '#ff7e00',
            0.7, '#ff0000',
            0.9, '#8f3f97',
            1, '#7e0023',
          ],
        },
      });
    };

    if (map.isStyleLoaded()) {
      applyHeatmap();
    } else {
      map.once('styledata', applyHeatmap);
    }
  }, [isHeatmapOn, isDarkMode]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://basemaps.cartocdn.com/gl/${isDarkMode ? 'dark-matter-gl-style' : 'positron-gl-style'}/style.json`,
      center: [20, 20],
      zoom: 2,
      pitch: 0,
      maxZoom: 14,
      minZoom: 1.5,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    const addMarkers = () => {
      MOCK_CITIES.forEach((city) => {
        const el = createMarkerElement(city);
        el.addEventListener('click', () => {
          setSelectedCity(city);
          map.flyTo({ center: [city.lng, city.lat], zoom: 8, duration: 1500 });
        });
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([city.lng, city.lat])
          .addTo(map);
        markersRef.current.push(marker);
      });
    };

    addMarkers();
    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Update map style on dark mode change
  useEffect(() => {
    if (!mapRef.current) return;
    const style = `https://basemaps.cartocdn.com/gl/${isDarkMode ? 'dark-matter-gl-style' : 'positron-gl-style'}/style.json`;
    mapRef.current.setStyle(style);
    mapRef.current.once('styledata', () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      MOCK_CITIES.forEach((city) => {
        const el = createMarkerElement(city);
        el.addEventListener('click', () => {
          setSelectedCity(city);
          mapRef.current?.flyTo({ center: [city.lng, city.lat], zoom: 8, duration: 1500 });
        });
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([city.lng, city.lat])
          .addTo(mapRef.current!);
        markersRef.current.push(marker);
      });
    });
  }, [isDarkMode, createMarkerElement, setSelectedCity]);

  return <div ref={mapContainer} className="absolute inset-0 w-full h-full" />;
}
