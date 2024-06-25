const Station = require('../models/stationModel');

// Контроллер для страницы со списком метеостанций 
exports.renderStationsPage = async (req, res) => {
  try {
    // Здесь можно получить список метеостанций из базы данных
    const stations = await Station.getAll();
    res.render('stations', { title: 'Stations', stations });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// Контроллер для страницы с информацией о метеостанции
exports.renderStationPage = async (req, res) => {
  try {
    // Здесь можно получить информацию о конкретной метеостанции из базы данных
    const station = await Station.getById(req.params.id);
    res.render('station', { title: station.name, station });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};
