const express = require('express')
const { register, login,logout, verify} = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddleware')

const router=express.Router()

router.post('/register',register)
router.post('/login',login)
router.post('/logout',logout)
router.get('/verify',verify)

module.exports=router