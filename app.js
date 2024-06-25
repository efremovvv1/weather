const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { User } = require('./models/models');
const { Station, Reading } = require('./models/stationModel');
const path = require('path');
const { getWeatherDescription, getWeatherIcon, getWindDirection } = require('./helpers/helpers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware для проверки аутентификации
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// Маршруты
app.get('/', isAuthenticated, (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userId = user.id;
    return res.redirect('/');
  }
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    return res.send('Username already exists. Please choose another one.');
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  await User.create({ username, password: hashedPassword });
  res.redirect('/login');
});

app.get('/dashboard', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const stations = await Station.findAll({ where: { UserId: userId } });
  stations.forEach(station => {
    station.weatherDescription = getWeatherDescription(station.weatherCode);
    station.weatherIcon = getWeatherIcon(station.weatherCode);
    station.windDirectionText = getWindDirection(station.windDirection);
  });
  res.render('dashboard', { stations });
});

app.post('/addStation', isAuthenticated, async (req, res) => {
  const { name, latitude, longitude } = req.body;
  const userId = req.session.userId;

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(weatherUrl);
    const weatherData = response.data;

    await Station.create({
      name,
      latitude,
      longitude,
      weather: weatherData.weather[0].description,
      weatherCode: weatherData.weather[0].id, // Код погоды
      temperature: weatherData.main.temp,
      minTemperature: weatherData.main.temp_min,
      maxTemperature: weatherData.main.temp_max,
      wind: weatherData.wind.speed,
      windDirection: weatherData.wind.deg, // Направление ветра в градусах
      pressure: weatherData.main.pressure,
      UserId: userId
    });
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to add station');
  }
});

app.post('/deleteStation/:id', isAuthenticated, async (req, res) => {
  const stationId = req.params.id;
  try {
    const result = await Station.destroy({ where: { id: stationId } });
    if (result) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Station not found' });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Failed to delete station' });
  }
});

app.get('/station/:id', isAuthenticated, async (req, res) => {
  const stationId = req.params.id;
  try {
    const station = await Station.findOne({ where: { id: stationId, UserId: req.session.userId } });
    const readings = await Reading.findAll({ where: { StationId: stationId }, order: [['timestamp', 'DESC']] });
    if (station) {
      station.weatherDescription = getWeatherDescription(station.weatherCode);
      station.weatherIcon = getWeatherIcon(station.weatherCode);
      station.windDirectionText = getWindDirection(station.windDirection);
      res.render('station', { station, readings });
    } else {
      res.status(404).send('Station not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to retrieve station information');
  }
});

app.post('/station/:id/addReading', isAuthenticated, async (req, res) => {
  const stationId = req.params.id;
  const { code, temperature, windSpeed, windDirection, pressure } = req.body;

  try {
    await Reading.create({
      code,
      temperature,
      windSpeed,
      windDirection,
      pressure,
      timestamp: new Date(),
      StationId: stationId
    });
    res.redirect(`/station/${stationId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to add reading');
  }
});

app.post('/station/:id/deleteReading/:readingId', isAuthenticated, async (req, res) => {
  const { id, readingId } = req.params;
  try {
    await Reading.destroy({ where: { id: readingId, StationId: id } });
    res.redirect(`/station/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to delete reading');
  }
});

app.post('/station/:id/autoMeasure', isAuthenticated, async (req, res) => {
  const stationId = req.params.id;
  const station = await Station.findOne({ where: { id: stationId, UserId: req.session.userId } });
  if (!station) {
    return res.status(404).send('Station not found');
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${station.latitude}&lon=${station.longitude}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(weatherUrl);
    const weatherData = response.data;

    await Reading.create({
      code: weatherData.weather[0].id,
      temperature: weatherData.main.temp,
      windSpeed: weatherData.wind.speed,
      windDirection: weatherData.wind.deg,
      pressure: weatherData.main.pressure,
      timestamp: new Date(),
      StationId: stationId
    });

    res.redirect(`/station/${stationId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to add automatic measurement');
  }
});

app.get('/api/station/:id/forecast', isAuthenticated, async (req, res) => {
  const stationId = req.params.id;
  const station = await Station.findOne({ where: { id: stationId, UserId: req.session.userId } });
  if (!station) {
    return res.status(404).send('Station not found');
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${station.latitude}&lon=${station.longitude}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(forecastUrl);
    const forecastData = response.data;

    const labels = [];
    const temperatures = [];
    const windSpeeds = [];

    forecastData.list.forEach(item => {
      labels.push(new Date(item.dt * 1000).toLocaleString());
      temperatures.push(item.main.temp);
      windSpeeds.push(item.wind.speed);
    });

    console.log('Forecast data:', { labels, temperatures, windSpeeds }); // Отладка

    res.json({ labels, temperatures, windSpeeds });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to retrieve weather forecast');
  }
});


// Маршрут для выхода из системы
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/');
    }
    res.redirect('/login');
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
