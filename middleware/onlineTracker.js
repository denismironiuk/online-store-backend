const redisClient = require('../utils/redis');
const { onlineUsersGauge } = require('../utils/prometheus');

const WINDOW_MINUTES = 5; 

// Middleware для каждого запроса
exports.trackOnline = async (req, res, next) => {
  // --- ПРЕДОХРАНИТЕЛЬ №1: Пропускаем трекер в режиме тестов ---
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  try {
    const identifier = req.user ? req.user.id : req.ip;
    const now = Date.now();

    // ZADD добавляет элемент в множество или обновляет его score (время), если он уже там
    await redisClient.zAdd('online_users', [{ score: now, value: identifier }]);
  } catch (err) {
    console.error('Redis tracker error:', err);
  }
  next();
};

// --- ПРЕДОХРАНИТЕЛЬ №2: Не запускаем таймер при тестировании ---
if (process.env.NODE_ENV !== 'test') {
  // Фоновая задача для очистки и подсчета (каждые 30 секунд)
  setInterval(async () => {
    try {
      const fiveMinsAgo = Date.now() - (WINDOW_MINUTES * 60 * 1000);

      // 1. УДАЛЯЕМ всех, чей score (время) меньше, чем 5 минут назад
      // -inf означает "от самого начала времен"
      await redisClient.zRemRangeByScore('online_users', '-inf', fiveMinsAgo);

      // 2. СЧИТАЕМ, сколько осталось в множестве
      const activeCount = await redisClient.zCard('online_users');

      // 3. ПЕРЕДАЕМ цифру в Prometheus
      onlineUsersGauge.set(activeCount);
      
    } catch (err) {
      console.error('Redis cleanup error:', err);
    }
  }, 30000);
}