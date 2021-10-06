const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const config = require('./config')
const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')
const HttpError = require('./models/http-error')

const app = express()

app.use(bodyParser.json())

app.use('/api/places', placesRoutes) // => filter placesRoutes to only be reached at /api/places

app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404)
  throw error
})

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error)
  }
  res
    .status(error.code || 500)
    .json(error.message || 'An unknown error occurred.')
})

mongoose
  .connect(config.MONGODB_KEY)
  .then(() => {
    app.listen(5000)
  })
  .catch((err) => {
    console.log(err)
  })