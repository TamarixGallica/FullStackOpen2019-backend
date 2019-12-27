const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})

  return response.json(users.map(user => user.toJSON()))
})

usersRouter.post('/', async (request, response) => {
  const body = request.body
  const user = new User(body)

  const saltRounds = 10

  user.passwordHash = await bcrypt.hash(body.password, saltRounds)

  const result = await user.save()

  return response.status(201).json(result.toJSON())
})

module.exports = usersRouter
