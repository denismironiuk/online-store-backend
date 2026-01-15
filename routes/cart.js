const express = require('express')
const router=express.Router()

const {addToCart,retrieveFromTheCart}=require('../controllers/cart')
const isAuth = require('../middleware/is-auth')

router.post('/cart', isAuth, addToCart)
router.get('/cart', isAuth, retrieveFromTheCart)

module.exports = router 