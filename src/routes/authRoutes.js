const express = require('express')
const { register, login,logout, verify,checkSession} = require('../controllers/authController')
const auth = require('../middlewares/authMiddleware')

const router=express.Router()

router.post('/register',register)
router.post('/login',login)
router.post('/logout',logout)
router.get('/verify',verify)
router.get('/check-session',auth,checkSession)
module.exports=router