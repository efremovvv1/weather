// Контроллер для главной страницы
exports.renderIndexPage = (req, res) => {
  res.render('index', { title: 'Welcome to Weathertop' });
};