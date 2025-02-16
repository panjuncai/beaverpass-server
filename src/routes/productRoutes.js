const express = require('express')
const {getAllProducts,getProductById} = require('../controllers/productController')
const authMiddleware = require('../middlewares/authMiddleware')

const router=express.Router()

router.get('/',getAllProducts)
router.get('/:productId',getProductById)

module.exports=router