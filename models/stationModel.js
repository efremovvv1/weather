const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

const Station = sequelize.define('Station', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  weather: {
    type: DataTypes.STRING,
  },
  weatherCode: {
    type: DataTypes.INTEGER,
  },
  weatherIcon: { // Новое поле для URL иконки
    type: DataTypes.STRING,
  },
  temperature: {
    type: DataTypes.FLOAT,
  },
  minTemperature: {
    type: DataTypes.FLOAT,
  },
  maxTemperature: {
    type: DataTypes.FLOAT,
  },
  wind: {
    type: DataTypes.FLOAT,
  },
  windDirection: {
    type: DataTypes.INTEGER,
  },
  pressure: {
    type: DataTypes.FLOAT,
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

const Reading = sequelize.define('Reading', {
  code: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  windSpeed: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  windDirection: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pressure: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
});

Station.hasMany(Reading);
Reading.belongsTo(Station);

sequelize.sync();

module.exports = { Station, Reading };
