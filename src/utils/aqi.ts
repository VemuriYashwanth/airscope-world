/** Returns AQI category info */
export function getAqiInfo(aqi: number) {
  if (aqi <= 50) return { label: 'Good', color: 'hsl(142, 72%, 45%)', cssClass: 'aqi-good', advice: 'Air quality is satisfactory. Enjoy outdoor activities.' };
  if (aqi <= 100) return { label: 'Moderate', color: 'hsl(45, 100%, 51%)', cssClass: 'aqi-moderate', advice: 'Air quality is acceptable. Unusually sensitive people should limit prolonged outdoor exertion.' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'hsl(30, 100%, 50%)', cssClass: 'aqi-sensitive', advice: 'Sensitive groups should limit prolonged outdoor exertion.' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'hsl(0, 80%, 55%)', cssClass: 'aqi-unhealthy', advice: 'Everyone may begin to experience health effects. Sensitive groups should avoid outdoor exertion.' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'hsl(280, 60%, 45%)', cssClass: 'aqi-very-unhealthy', advice: 'Health alert: everyone may experience serious health effects. Avoid outdoor activities.' };
  return { label: 'Hazardous', color: 'hsl(0, 60%, 30%)', cssClass: 'aqi-hazardous', advice: 'Health emergency. Everyone should avoid all outdoor activities.' };
}

/** Returns marker size based on AQI */
export function getMarkerSize(aqi: number): number {
  if (aqi <= 50) return 12;
  if (aqi <= 100) return 14;
  if (aqi <= 150) return 16;
  if (aqi <= 200) return 18;
  if (aqi <= 300) return 20;
  return 24;
}
