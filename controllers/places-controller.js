const HttpError = require('../models/http-error')

const DUMMY_PLACES = [
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

const GetPlaceById = (req, res, next) => {
  const placeId = req.params.pid // { pid: 'p1' }
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId
  })

  if (!place) {
    throw new HttpError('Could not find place for the provided id.', 404)
  }

  res.json({ place })
}

const GetPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid
  const user = DUMMY_PLACES.find((u) => {
    return u.creator === userId
  })

  if (!user) {
    return next(
      new HttpError('Could not find place for the provided user id.', 404)
    )
  }

  res.json({ user })
}

exports.GetPlaceById = GetPlaceById
exports.GetPlaceByUserId = GetPlaceByUserId