const express = require('express')

const { check } = require('express-validator')

const router = express.Router()

const PlacesControllers = require('../controllers/places-controller')
const fileUpload = require('../middleware/file-upload')
const checkAuth = require('../middleware/check-auth')

router.get('/:pid', PlacesControllers.getPlaceById)

router.get('/user/:uid', PlacesControllers.getPlacesByUserId)

router.use(checkAuth)

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  PlacesControllers.createPlace
)

router.patch(
  '/:pid',
  [check('title').not().isEmpty(),
check('description').isLength({ min: 5 })],
  PlacesControllers.updatePlace
)

router.delete('/:pid', PlacesControllers.deletePlace)

module.exports = router
