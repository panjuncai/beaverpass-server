const express = require('express')
const {product} = require('../controllers/productController')
const authMiddleware = require('../middlewares/authMiddleware')

const router=express.Router()

router.get('/',product)

module.exports=router