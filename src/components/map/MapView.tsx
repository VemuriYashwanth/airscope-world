import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { useAppStore, CityData } from '@/store/useAppStore';
import { MOCK_CITIES } from '@/data/mockCities';
import { getAqiInfo, getMarkerSize } from '@/utils/aqi';

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const heatmapAppliedRef = useRef(false);
  const { setSelectedCity, isDarkMode, isHeatmapOn } = useAppStore();

  const createMarkerElement = useCallback((city: CityData) => {
    const info = getAqiInfo(city.aqi);
    const size = getMarkerSize(city.aqi);
    
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

  // Find nearest mock city to a coordinate
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

  const addHeatmapSource = useCallback((map: maplibregl.Map) => {
    if (map.getSource('aqi-points')) return;
    
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
      layout: {
        visibility: 'none',
      },
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'aqi'], 0, 0.2, 50, 0.4, 150, 0.7, 300, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 2, 5, 3, 9, 5],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 80, 3, 100, 6, 70, 9, 50],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0.85, 9, 0.5],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.01, 'rgba(0,228,0,0.3)',
          0.05, '#00e400',
          0.2, '#ffff00',
          0.4, '#ff7e00',
          0.6, '#ff0000',
          0.8, '#8f3f97',
          1, '#7e0023',
        ],
      },
    });
    console.log('Heatmap source + layer initialized');
  }, []);

  // Heatmap visibility toggle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const setVisibility = () => {
      try {
        if (map.getLayer('aqi-heat')) {
          map.setLayoutProperty('aqi-heat', 'visibility', isHeatmapOn ? 'visible' : 'none');
          console.log('Heatmap visibility set to:', isHeatmapOn ? 'visible' : 'none');
        }
      } catch (err) {
        console.error('Failed to toggle heatmap visibility:', err);
      }
    };

    if (map.isStyleLoaded()) {
      setVisibility();
    } else {
      map.once('load', setVisibility);
    }
  }, [isHeatmapOn]);

  // Map init
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

    map.on('load', () => {
      console.log('Map loaded, adding heatmap source');
      addHeatmapSource(map);
      // If heatmap was already toggled on before load
      if (useAppStore.getState().isHeatmapOn) {
        map.setLayoutProperty('aqi-heat', 'visibility', 'visible');
      }
    });

    // Add markers
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

    // Click on map labels
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

    // Change cursor on place labels
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

    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Dark mode style swap
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const style = `https://basemaps.cartocdn.com/gl/${isDarkMode ? 'dark-matter-gl-style' : 'positron-gl-style'}/style.json`;
    map.setStyle(style);
    map.once('styledata', () => {
      // Re-add markers
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

      // Re-add heatmap source after style change
      map.once('load', () => {
        addHeatmapSource(map);
        if (useAppStore.getState().isHeatmapOn) {
          map.setLayoutProperty('aqi-heat', 'visibility', 'visible');
        }
      });
    });
  }, [isDarkMode, createMarkerElement, setSelectedCity, addHeatmapSource]);

  return <div ref={mapContainer} className="absolute inset-0 w-full h-full" />;
}
