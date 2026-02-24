const client = require('prom-client');

// Создаем реестр
const register = new client.Registry();

// Включаем дефолтные метрики (память, Event Loop и т.д.)
client.collectDefaultMetrics({ register });

// Создаем свою метрику: Гистограмма времени выполнения HTTP-запросов
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10] // Корзины в секундах
});

register.registerMetric(httpRequestDurationMicroseconds);

const onlineUsersGauge = new client.Gauge({
  name: 'shop_online_users_current',
  help: 'Number of active users in the last 5 minutes'
});

register.registerMetric(onlineUsersGauge);

module.exports = { register, httpRequestDurationMicroseconds, onlineUsersGauge };

