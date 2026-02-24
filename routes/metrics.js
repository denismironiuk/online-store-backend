const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metrics');

// Маршрут будет доступен по адресу /metrics
router.get('/metrics', metricsController.getMetrics);

module.exports = router;