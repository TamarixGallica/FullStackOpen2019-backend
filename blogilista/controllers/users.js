const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const config = require('../utils/config')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', ['title', 'author', 'likes', 'url'])

  return response.json(users.map(user => user.toJSON()))
})

usersRouter.post('/', async (request, response, next) => {
  const body = request.body

  if(body.password === undefined) {
    return response.status(400).json({message: 'Password has to be specified'})
  }

  if(body.password.length < 3) {
    return response.status(400).send({message: 'Minimum length for password is three (3) characters'})
  }

  const user = new User(body)

  user.passwordHash = await bcrypt.hash(body.password, config.SALTROUNDS)

  try {
    const result = await user.save()

    return response.status(201).json(result.toJSON())
  }
  catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter
