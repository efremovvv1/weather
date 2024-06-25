const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
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
  temperature: {
    type: DataTypes.FLOAT,
  },
  wind: {
    type: DataTypes.FLOAT,
  },
  pressure: {
    type: DataTypes.FLOAT,
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

User.hasMany(Station);
Station.belongsTo(User);

Station.hasMany(Reading);
Reading.belongsTo(Station);

sequelize.sync();

module.exports = { User, Station, Reading };
