const express = require('express')
const { getCategories,addCategories,getFeaturedCategories} = require('../controllers/category');
const router=express.Router()

router.get('/category',getCategories)
router.get('/featured',getFeaturedCategories)
router.post('/category',addCategories)


module.exports = router