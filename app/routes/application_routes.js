// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for applications
const Application = require('../models/application')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existent document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { Application: { title: '', text: 'foo' } } -> { Application: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /applications
router.get('/applications', requireToken, (req, res, next) => {
  Application.find()
    // respond with status 200 and JSON of the applications
    .then(applications => res.status(200).json({ applications: applications }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /applications/5a7db6c74d55bc51bdf39793
router.get('/applications/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Application.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesfull, respond with 200 and "Application" JSON
    .then(application => res.status(200).json({ application: application }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /applications
router.post('/applications', requireToken, (req, res, next) => {
  // set owner of new Application to be current user
  req.body.application.owner = req.user.id

  Application.create(req.body.application)
    // respond to succesful `create` with status 201 and JSON of new "Application"
    .then(application => {
      res.status(201).json({ application })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /applications/5a7db6c74d55bc51bdf39793
router.patch('/applications/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.application.owner

  Application.findById(req.params.id)
    .then(handle404)
    // ensure the signed in user (req.user.id) is the same as the Application's owner (Application.owner)
    .then(application => requireOwnership(req, application))
    // updating Application object with ApplicationData
    .then(application => Application.updateOne(req.body.application))
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /applications/5a7db6c74d55bc51bdf39793
router.delete('/applications/:id', requireToken, (req, res, next) => {
  Application.findById(req.params.id)
    .then(handle404)
  // ensure the signed in user (req.user.id) is the same as the Application's owner (Application.owner)
    .then(application => requireOwnership(req, application))
    // delete Application from mongodb
    .then(application => Application.deleteOne())
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
