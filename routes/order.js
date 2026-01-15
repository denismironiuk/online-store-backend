const express = require('express');
const router = express.Router();
const {stripeWebhook} =require('../controllers/stripe');
const isAuth = require('../middleware/is-auth');
const { getUserOrders,getSingleOrderPdf,getSingleInvoice } = require('../controllers/order');

router.post('/webhook', express.raw({type: '*/*'}),stripeWebhook );

router.get('/orders',isAuth,getUserOrders)

router.get('/order/:orderId/pdf',getSingleOrderPdf)
router.get('/order/:orderId/invoice',getSingleInvoice)

module.exports = router;
