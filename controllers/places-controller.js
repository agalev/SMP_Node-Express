const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/place')
const User = require('../models/user')
const mongooseUniqueValidator = require('mongoose-unique-validator')

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous skyscrapers in the world.',
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1',
  },
]

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid // { pid: 'p1' }
  let place
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a place.',
      500
    )
    return next(error)
  }

  if (!place) {
    const error = new HttpError(
      'Could not find place for the provided id.',
      404
    )
    return next(error)
  }

  res.json({ place: place.toObject({ getters: true }) })
}

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid
  let places

  try {
    places = await Place.find({ creator: userId })
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, could not find places for the provided user.',
      500
    )
    return next(error)
  }

  if (!places || places.length === 0) {
    const error = new HttpError(
      'Could not find places for the provided user id.',
      404
    )
    return next(error)
  }

  res.json({ places: places.map((place) => place.toObject({ getters: true })) })
}

const createPlace = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    )
  }

  const { title, description, address, creator } = req.body

  let coordinates
  try {
    coordinates = await getCoordsForAddress(address)
  } catch (error) {
    return next(error)
  }

  const createdPlace = new Place({
    title,
    description,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Gnaphalium_leontopodium_Atlas_Alpenflora.jpg/1024px-Gnaphalium_leontopodium_Atlas_Alpenflora.jpg',
    address,
    location: coordinates,
    creator,
  })

  let user

  try {
    user = await User.findById(creator)
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500)
    return next(error)
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404)
    return next(error)
  }
  console.log(user)

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await createdPlace.save({ session: sess })
    user.places.push(createdPlace)
    await user.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500)
    return next(error)
  }
  res.status(201).json({ place: createdPlace })
}

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    )
  }
  const { title, description } = req.body
  const placeId = req.params.pid

  let place
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place(1)',
      500
    )
    return next(error)
  }

  place.title = title
  place.description = description

  try {
    await place.save()
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place(2)',
      500
    )
    return next(error)
  }

  res.status(200).json({ place: place.toObject({ getters: true }) })
}

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid
  let place
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Could not delete place',
      500
    )
  }

  try {
    await place.delete()
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Could not delete place',
      500
    )
  }
  res.status(200).json({ message: 'Deleted place.' })
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace
