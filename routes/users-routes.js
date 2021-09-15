const express = require('express')

const router = express.Router()

const UsersController = require('../controllers/users-controller')

router.get('/', UsersController.getUsers)

router.post('/signup', UsersController.signup)

router.post('/login', UsersController.login)

module.exports = router