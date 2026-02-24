const { register } = require('../utils/prometheus');

exports.getMetrics = async (req, res, next) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    next(error); // Передаем ошибку в твой глобальный обработчик
  }
};