import { CityData } from '@/store/useAppStore';

const weatherIcons = ['☀️', '⛅', '🌤', '🌥', '☁️', '🌧', '⛈', '🌦'];
const windDirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randF(min: number, max: number) { return +(Math.random() * (max - min) + min).toFixed(1); }

function generateHourly() {
  const hours = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const h = new Date(now.getTime() + i * 3600000);
    hours.push({
      hour: h.getHours().toString().padStart(2, '0') + ':00',
      temp: rand(-5, 40),
      aqi: rand(10, 300),
      icon: weatherIcons[rand(0, 7)],
    });
  }
  return hours;
}

function generateDaily() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  return Array.from({ length: 7 }, (_, i) => ({
    day: days[(today + i) % 7],
    high: rand(15, 38),
    low: rand(-2, 15),
    aqi: rand(15, 250),
    icon: weatherIcons[rand(0, 7)],
  }));
}

export const MOCK_CITIES: CityData[] = [
  { id: '1', name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, aqi: 185, pm25: 120, pm10: 180, co: 1.2, no2: 45, o3: 35, temperature: 22, humidity: 45, windSpeed: 12, windDirection: 'NW', uvIndex: 6, weatherIcon: '🌤', weatherDescription: 'Partly Cloudy', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '2', name: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.2090, aqi: 256, pm25: 200, pm10: 280, co: 2.1, no2: 68, o3: 28, temperature: 35, humidity: 55, windSpeed: 8, windDirection: 'SE', uvIndex: 9, weatherIcon: '☀️', weatherDescription: 'Sunny', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '3', name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, aqi: 42, pm25: 12, pm10: 22, co: 0.3, no2: 18, o3: 55, temperature: 14, humidity: 72, windSpeed: 18, windDirection: 'SW', uvIndex: 3, weatherIcon: '🌥', weatherDescription: 'Overcast', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '4', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, aqi: 68, pm25: 25, pm10: 42, co: 0.5, no2: 22, o3: 48, temperature: 18, humidity: 65, windSpeed: 10, windDirection: 'E', uvIndex: 5, weatherIcon: '⛅', weatherDescription: 'Partly Cloudy', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '5', name: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, aqi: 88, pm25: 35, pm10: 55, co: 0.7, no2: 30, o3: 62, temperature: 26, humidity: 40, windSpeed: 14, windDirection: 'W', uvIndex: 8, weatherIcon: '☀️', weatherDescription: 'Sunny', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '6', name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, aqi: 165, pm25: 95, pm10: 150, co: 1.5, no2: 52, o3: 30, temperature: 33, humidity: 30, windSpeed: 15, windDirection: 'N', uvIndex: 10, weatherIcon: '☀️', weatherDescription: 'Clear', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '7', name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, aqi: 72, pm25: 28, pm10: 45, co: 0.6, no2: 25, o3: 40, temperature: 24, humidity: 68, windSpeed: 9, windDirection: 'SE', uvIndex: 7, weatherIcon: '🌦', weatherDescription: 'Light Rain', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '8', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, aqi: 28, pm25: 8, pm10: 15, co: 0.2, no2: 10, o3: 60, temperature: 20, humidity: 58, windSpeed: 20, windDirection: 'S', uvIndex: 6, weatherIcon: '🌤', weatherDescription: 'Mostly Sunny', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '9', name: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173, aqi: 95, pm25: 40, pm10: 65, co: 0.8, no2: 35, o3: 32, temperature: 5, humidity: 75, windSpeed: 16, windDirection: 'NW', uvIndex: 2, weatherIcon: '☁️', weatherDescription: 'Cloudy', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '10', name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792, aqi: 142, pm25: 78, pm10: 120, co: 1.3, no2: 42, o3: 25, temperature: 30, humidity: 82, windSpeed: 7, windDirection: 'SW', uvIndex: 11, weatherIcon: '⛈', weatherDescription: 'Thunderstorms', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '11', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, aqi: 55, pm25: 18, pm10: 30, co: 0.4, no2: 20, o3: 50, temperature: 16, humidity: 60, windSpeed: 12, windDirection: 'W', uvIndex: 4, weatherIcon: '⛅', weatherDescription: 'Partly Cloudy', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '12', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, aqi: 120, pm25: 65, pm10: 110, co: 0.9, no2: 38, o3: 42, temperature: 38, humidity: 35, windSpeed: 22, windDirection: 'NE', uvIndex: 12, weatherIcon: '☀️', weatherDescription: 'Hot & Clear', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '13', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, aqi: 155, pm25: 88, pm10: 130, co: 1.1, no2: 40, o3: 30, temperature: 32, humidity: 78, windSpeed: 6, windDirection: 'S', uvIndex: 10, weatherIcon: '🌧', weatherDescription: 'Rain', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '14', name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, aqi: 62, pm25: 20, pm10: 35, co: 0.5, no2: 24, o3: 55, temperature: 12, humidity: 55, windSpeed: 18, windDirection: 'NW', uvIndex: 4, weatherIcon: '🌤', weatherDescription: 'Clear', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '15', name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, aqi: 48, pm25: 14, pm10: 25, co: 0.3, no2: 15, o3: 45, temperature: 22, humidity: 50, windSpeed: 11, windDirection: 'E', uvIndex: 9, weatherIcon: '🌤', weatherDescription: 'Pleasant', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '16', name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, aqi: 78, pm25: 30, pm10: 50, co: 0.6, no2: 28, o3: 44, temperature: 18, humidity: 62, windSpeed: 14, windDirection: 'NE', uvIndex: 5, weatherIcon: '⛅', weatherDescription: 'Partly Cloudy', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '17', name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, aqi: 132, pm25: 72, pm10: 100, co: 1.0, no2: 38, o3: 35, temperature: 20, humidity: 48, windSpeed: 8, windDirection: 'SE', uvIndex: 8, weatherIcon: '🌤', weatherDescription: 'Hazy Sun', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '18', name: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, aqi: 22, pm25: 5, pm10: 10, co: 0.1, no2: 8, o3: 58, temperature: 8, humidity: 70, windSpeed: 15, windDirection: 'W', uvIndex: 2, weatherIcon: '☁️', weatherDescription: 'Overcast', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '19', name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, aqi: 178, pm25: 105, pm10: 160, co: 1.4, no2: 48, o3: 28, temperature: 31, humidity: 80, windSpeed: 5, windDirection: 'NW', uvIndex: 11, weatherIcon: '🌧', weatherDescription: 'Heavy Rain', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
  { id: '20', name: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417, aqi: 18, pm25: 4, pm10: 8, co: 0.1, no2: 6, o3: 62, temperature: 12, humidity: 55, windSpeed: 10, windDirection: 'N', uvIndex: 3, weatherIcon: '☀️', weatherDescription: 'Clear', hourlyForecast: generateHourly(), dailyForecast: generateDaily() },
];
