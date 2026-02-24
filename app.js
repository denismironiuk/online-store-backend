const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const { httpRequestDurationMicroseconds } = require('./utils/prometheus');
const metricsRoutes = require('./routes/metrics');
const prodRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const catRoutes = require('./routes/category');
const subCatRoutes = require('./routes/subcategory');
const orderRoutes = require('./routes/order');
const cartRoutes = require('./routes/cart');

// ВАЖНО: Мы больше не делаем require('./utils/redis') прямо здесь в корне, 
// иначе он попытается подключиться при импорте в тестах.

const { trackOnline } = require('./middleware/onlineTracker');

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(
  bodyParser.json({
      verify: function(req, res, buf) {
          req.rawBody = buf;
      }
  })
);

// Middleware для сбора метрик
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const durationInSeconds = process.hrtime(start)[0] + process.hrtime(start)[1] / 1e9;
    const routePath = req.route ? req.route.path : req.path; 
    httpRequestDurationMicroseconds
      .labels(req.method, routePath, res.statusCode)
      .observe(durationInSeconds);
  });
  next();
});

app.use(trackOnline);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/api', orderRoutes);
app.use('/api', prodRoutes);
app.use('/api', adminRoutes);
app.use('/api', authRoutes);
app.use('/api', cartRoutes);
app.use('/api', catRoutes);
app.use('/api', subCatRoutes);
app.use('/', metricsRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, error: data });
});

// ЭКСПОРТИРУЕМ ПРИЛОЖЕНИЕ ДЛЯ ТЕСТОВ (БЕЗ ЗАПУСКА)
module.exports = app;