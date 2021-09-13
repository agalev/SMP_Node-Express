const express = require('express')

const HttpError = require('../models/http-error')

const router = express.Router()

const PlacesControllers = require('../controllers/places-controller')

router.get('/:pid', PlacesControllers.GetPlaceById)

router.get('/user/:uid', PlacesControllers.GetPlaceByUserId)

module.exports = router
