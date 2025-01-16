const express = require('express')
const { register, login, verify, user } = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')

const router=express.Router()

router.post('/register',register)
router.post('/login',login)
router.get('/verify',verify)
router.get('/user',authMiddleware,user)

module.exports=router