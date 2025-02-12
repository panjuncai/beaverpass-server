const express = require('express')
const {category} = require('../controllers/categoryController')
const authMiddleware = require('../middlewares/authMiddleware')

const router=express.Router()

router.get('/',authMiddleware,category)

module.exports=router