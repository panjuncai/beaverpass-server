const express = require('express')
const { register, login,logout, verify,checkSession} = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddleware')

const router=express.Router()

router.post('/register',register)
router.post('/login',login)
router.post('/logout',logout)
router.get('/verify',verify)
router.get('/check-session',checkSession)
module.exports=router