const weatherCodes = {
  200: 'Thunderstorm with light rain',
  201: 'Thunderstorm with rain',
  202: 'Thunderstorm with heavy rain',
  300: 'Drizzle',
  500: 'Light rain',
  501: 'Moderate rain',
  502: 'Heavy rain',
  600: 'Light snow',
  601: 'Snow',
  800: 'Clear sky',
  801: 'Few clouds',
  802: 'Scattered clouds',
  803: 'Broken clouds',
  804: 'Overcast clouds'
};

const weatherIcons = {
  200: '11d.png',
  201: '11d.png',
  202: '11d.png',
  300: '09d.png',
  500: '10d.png',
  501: '10d.png',
  502: '10d.png',
  600: '13d.png',
  601: '13d.png',
  800: '01d.png',
  801: '02d.png',
  802: '03d.png',
  803: '04d.png',
  804: '04d.png'
};

const windDirections = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
];

function getWeatherDescription(code) {
  return weatherCodes[code] || 'Unknown weather condition';
}

function getWeatherIcon(code) {
  return `/images/weather-icons/${weatherIcons[code] || 'default.png'}`;
}

function getWindDirection(degree) {
  const index = Math.floor((degree + 11.25) / 22.5) % 16;
  return windDirections[index];
}

module.exports = { getWeatherDescription, getWeatherIcon, getWindDirection };
