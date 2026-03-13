import { CityData } from '@/store/useAppStore';

const weatherIcons = ['☀️', '⛅', '🌤', '🌥', '☁️', '🌧', '⛈', '🌦'];

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

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

function city(id: string, name: string, country: string, lat: number, lng: number, aqi: number, pm25: number, pm10: number, co: number, no2: number, o3: number, temperature: number, humidity: number, windSpeed: number, windDirection: string, uvIndex: number, weatherIcon: string, weatherDescription: string): CityData {
  return { id, name, country, lat, lng, aqi, pm25, pm10, co, no2, o3, temperature, humidity, windSpeed, windDirection, uvIndex, weatherIcon, weatherDescription, hourlyForecast: generateHourly(), dailyForecast: generateDaily() };
}

export const MOCK_CITIES: CityData[] = [
  // Asia
  city('1','Beijing','China',39.9042,116.4074,185,120,180,1.2,45,35,22,45,12,'NW',6,'🌤','Partly Cloudy'),
  city('2','New Delhi','India',28.6139,77.209,256,200,280,2.1,68,28,35,55,8,'SE',9,'☀️','Sunny'),
  city('3','Tokyo','Japan',35.6762,139.6503,68,25,42,0.5,22,48,18,65,10,'E',5,'⛅','Partly Cloudy'),
  city('4','Bangkok','Thailand',13.7563,100.5018,155,88,130,1.1,40,30,32,78,6,'S',10,'🌧','Rain'),
  city('5','Jakarta','Indonesia',-6.2088,106.8456,178,105,160,1.4,48,28,31,80,5,'NW',11,'🌧','Heavy Rain'),
  city('6','Seoul','South Korea',37.5665,126.978,75,30,48,0.6,25,50,15,58,14,'NW',4,'⛅','Partly Cloudy'),
  city('7','Shanghai','China',31.2304,121.4737,145,82,125,1.0,38,32,20,60,10,'E',5,'🌥','Overcast'),
  city('8','Mumbai','India',19.076,72.8777,210,155,220,1.8,55,22,33,75,6,'SW',10,'🌤','Hazy'),
  city('9','Singapore','Singapore',1.3521,103.8198,52,15,28,0.3,12,55,30,82,8,'SE',9,'⛈','Thunderstorms'),
  city('10','Hong Kong','China',22.3193,114.1694,88,38,55,0.7,28,42,25,70,12,'E',7,'🌤','Clear'),
  city('11','Taipei','Taiwan',25.033,121.5654,62,20,35,0.4,18,52,22,68,11,'NE',6,'⛅','Partly Cloudy'),
  city('12','Dhaka','Bangladesh',23.8103,90.4125,235,180,260,2.0,62,20,32,80,5,'S',8,'🌥','Hazy'),
  city('13','Karachi','Pakistan',24.8607,67.0011,195,140,200,1.6,50,25,34,45,10,'SW',10,'☀️','Hot & Clear'),
  city('14','Hanoi','Vietnam',21.0278,105.8342,162,92,140,1.2,42,28,28,78,7,'N',6,'🌥','Overcast'),
  city('15','Manila','Philippines',14.5995,120.9842,85,35,52,0.6,24,45,30,75,9,'W',9,'🌦','Light Rain'),
  city('16','Kolkata','India',22.5726,88.3639,220,165,235,1.9,58,22,31,72,6,'SE',8,'🌤','Hazy Sun'),
  city('17','Osaka','Japan',34.6937,135.5023,55,18,30,0.4,15,52,20,62,12,'SW',5,'☀️','Clear'),
  city('18','Kuala Lumpur','Malaysia',3.139,101.6869,72,28,44,0.5,20,48,31,80,7,'NW',10,'⛈','Thunderstorms'),
  city('19','Chennai','India',13.0827,80.2707,175,100,155,1.3,44,30,34,70,8,'E',9,'☀️','Hot'),
  city('20','Lahore','Pakistan',31.5204,74.3587,280,220,310,2.5,72,18,28,50,6,'NW',7,'🌥','Smoky'),

  // Europe
  city('21','London','UK',51.5074,-0.1278,42,12,22,0.3,18,55,14,72,18,'SW',3,'🌥','Overcast'),
  city('22','Paris','France',48.8566,2.3522,55,18,30,0.4,20,50,16,60,12,'W',4,'⛅','Partly Cloudy'),
  city('23','Berlin','Germany',52.52,13.405,48,14,25,0.3,16,54,12,55,15,'W',3,'☁️','Cloudy'),
  city('24','Moscow','Russia',55.7558,37.6173,95,40,65,0.8,35,32,5,75,16,'NW',2,'☁️','Cloudy'),
  city('25','Madrid','Spain',40.4168,-3.7038,52,16,28,0.3,15,58,24,38,10,'SW',7,'☀️','Sunny'),
  city('26','Rome','Italy',41.9028,12.4964,58,20,34,0.4,18,52,22,50,8,'S',6,'☀️','Clear'),
  city('27','Istanbul','Turkey',41.0082,28.9784,78,30,50,0.6,28,44,18,62,14,'NE',5,'⛅','Partly Cloudy'),
  city('28','Stockholm','Sweden',59.3293,18.0686,22,5,10,0.1,8,58,8,70,15,'W',2,'☁️','Overcast'),
  city('29','Amsterdam','Netherlands',52.3676,4.9041,38,10,18,0.2,14,56,13,65,16,'SW',3,'🌥','Cloudy'),
  city('30','Warsaw','Poland',52.2297,21.0122,65,22,38,0.5,20,46,10,58,12,'E',3,'☁️','Overcast'),
  city('31','Athens','Greece',37.9838,23.7275,70,26,42,0.5,22,48,26,42,8,'N',8,'☀️','Sunny'),
  city('32','Zurich','Switzerland',47.3769,8.5417,18,4,8,0.1,6,62,12,55,10,'N',3,'☀️','Clear'),
  city('33','Vienna','Austria',48.2082,16.3738,35,9,16,0.2,12,55,14,52,11,'NW',4,'⛅','Partly Cloudy'),
  city('34','Prague','Czech Republic',50.0755,14.4378,55,17,30,0.4,18,48,11,56,13,'W',3,'☁️','Cloudy'),
  city('35','Dublin','Ireland',53.3498,-6.2603,28,7,14,0.2,10,58,10,75,20,'SW',2,'🌧','Rainy'),
  city('36','Lisbon','Portugal',38.7223,-9.1393,40,11,20,0.3,14,56,20,55,12,'NW',6,'☀️','Clear'),
  city('37','Oslo','Norway',59.9139,10.7522,20,4,9,0.1,7,60,6,68,14,'W',1,'☁️','Overcast'),
  city('38','Helsinki','Finland',60.1699,24.9384,18,4,8,0.1,6,60,4,72,12,'W',1,'☁️','Cloudy'),
  city('39','Bucharest','Romania',44.4268,26.1025,72,28,45,0.6,24,42,18,55,10,'NE',5,'⛅','Partly Cloudy'),
  city('40','Budapest','Hungary',47.4979,19.0402,60,22,36,0.5,20,46,16,54,11,'E',4,'⛅','Partly Cloudy'),

  // Americas
  city('41','New York','USA',40.7128,-74.006,62,20,35,0.5,24,55,12,55,18,'NW',4,'🌤','Clear'),
  city('42','Los Angeles','USA',34.0522,-118.2437,88,35,55,0.7,30,62,26,40,14,'W',8,'☀️','Sunny'),
  city('43','São Paulo','Brazil',-23.5505,-46.6333,72,28,45,0.6,25,40,24,68,9,'SE',7,'🌦','Light Rain'),
  city('44','Mexico City','Mexico',19.4326,-99.1332,132,72,100,1.0,38,35,20,48,8,'SE',8,'🌤','Hazy Sun'),
  city('45','Toronto','Canada',43.6532,-79.3832,38,10,18,0.2,14,56,8,60,16,'W',3,'⛅','Partly Cloudy'),
  city('46','Buenos Aires','Argentina',-34.6037,-58.3816,55,18,30,0.4,16,50,22,58,14,'NE',6,'☀️','Clear'),
  city('47','Lima','Peru',-12.0464,-77.0428,95,42,68,0.7,30,38,20,78,8,'S',7,'🌥','Overcast'),
  city('48','Bogotá','Colombia',4.711,-74.0721,82,34,52,0.6,26,42,16,72,10,'E',8,'🌦','Light Rain'),
  city('49','Santiago','Chile',-33.4489,-70.6693,110,58,85,0.9,34,36,18,45,12,'SW',7,'🌤','Clear'),
  city('50','Chicago','USA',41.8781,-87.6298,55,17,30,0.4,20,52,10,52,18,'NW',4,'⛅','Partly Cloudy'),
  city('51','Houston','USA',29.7604,-95.3698,72,28,44,0.5,22,48,28,65,10,'S',7,'☀️','Sunny'),
  city('52','Miami','USA',25.7617,-80.1918,48,14,24,0.3,16,55,30,72,12,'SE',8,'☀️','Sunny'),
  city('53','Vancouver','Canada',49.2827,-123.1207,25,6,12,0.1,8,60,10,65,14,'W',3,'🌧','Rainy'),
  city('54','Rio de Janeiro','Brazil',-22.9068,-43.1729,68,24,40,0.5,22,44,28,70,10,'E',9,'☀️','Sunny'),
  city('55','Havana','Cuba',23.1136,-82.3666,58,19,32,0.4,17,48,29,74,8,'NE',8,'☀️','Hot'),

  // Africa
  city('56','Cairo','Egypt',30.0444,31.2357,165,95,150,1.5,52,30,33,30,15,'N',10,'☀️','Clear'),
  city('57','Lagos','Nigeria',6.5244,3.3792,142,78,120,1.3,42,25,30,82,7,'SW',11,'⛈','Thunderstorms'),
  city('58','Nairobi','Kenya',-1.2921,36.8219,48,14,25,0.3,15,45,22,50,11,'E',9,'🌤','Pleasant'),
  city('59','Johannesburg','South Africa',-26.2041,28.0473,62,20,34,0.4,18,50,20,40,15,'N',8,'☀️','Clear'),
  city('60','Cape Town','South Africa',-33.9249,18.4241,30,8,14,0.2,10,58,18,55,18,'SE',7,'☀️','Sunny'),
  city('61','Casablanca','Morocco',33.5731,-7.5898,72,26,42,0.5,22,44,22,60,12,'NW',7,'⛅','Partly Cloudy'),
  city('62','Addis Ababa','Ethiopia',9.0192,38.7525,55,17,30,0.4,15,48,20,45,8,'E',9,'🌤','Clear'),
  city('63','Accra','Ghana',5.6037,-0.187,85,36,55,0.7,25,40,29,78,8,'SW',10,'🌦','Light Rain'),
  city('64','Kinshasa','DR Congo',-4.4419,15.2663,120,65,100,1.0,38,28,30,82,5,'W',10,'⛈','Thunderstorms'),
  city('65','Dar es Salaam','Tanzania',-6.7924,39.2083,52,16,28,0.3,14,48,28,76,10,'E',10,'☀️','Hot'),

  // Middle East
  city('66','Dubai','UAE',25.2048,55.2708,120,65,110,0.9,38,42,38,35,22,'NE',12,'☀️','Hot & Clear'),
  city('67','Riyadh','Saudi Arabia',24.7136,46.6753,155,88,140,1.2,44,30,40,20,18,'N',12,'☀️','Hot'),
  city('68','Tehran','Iran',35.6892,51.389,165,95,145,1.4,48,28,25,35,10,'W',7,'🌤','Hazy'),
  city('69','Baghdad','Iraq',33.3152,44.3661,180,110,170,1.5,50,25,38,25,12,'NW',10,'☀️','Hot & Dusty'),
  city('70','Doha','Qatar',25.2854,51.531,105,55,90,0.8,32,40,36,40,20,'NE',11,'☀️','Clear'),

  // Oceania
  city('71','Sydney','Australia',-33.8688,151.2093,28,8,15,0.2,10,60,20,58,20,'S',6,'🌤','Mostly Sunny'),
  city('72','Melbourne','Australia',-37.8136,144.9631,32,9,16,0.2,12,58,16,60,18,'SW',5,'⛅','Partly Cloudy'),
  city('73','Auckland','New Zealand',-36.8485,174.7633,20,5,10,0.1,7,62,15,65,14,'W',4,'🌤','Pleasant'),
  city('74','Brisbane','Australia',-27.4698,153.0251,35,10,18,0.2,11,56,24,55,12,'E',8,'☀️','Sunny'),
  city('75','Perth','Australia',-31.9505,115.8605,25,6,12,0.1,8,60,22,48,16,'SW',7,'☀️','Clear'),

  // More Asia
  city('76','Bengaluru','India',12.9716,77.5946,125,68,95,0.9,35,35,28,60,10,'E',8,'🌤','Pleasant'),
  city('77','Hyderabad','India',17.385,78.4867,145,80,120,1.1,40,30,32,55,8,'SE',9,'☀️','Hot'),
  city('78','Pune','India',18.5204,73.8567,130,70,100,1.0,36,32,30,58,9,'W',8,'🌤','Clear'),
  city('79','Ahmedabad','India',23.0225,72.5714,190,130,185,1.6,52,25,35,40,10,'NW',10,'☀️','Hot'),
  city('80','Jaipur','India',26.9124,75.7873,200,145,210,1.7,55,22,33,35,8,'N',9,'☀️','Hot & Dusty'),
];
