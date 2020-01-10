const testingRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')
const config = require('../utils/config')

testingRouter.post('/reset', async (request, response, next) => {
  try {
    await User.deleteMany({})
    await Blog.deleteMany({})

    return response.status(204).end()
  }
  catch (exception) {
    next(exception)
  }
})

module.exports = testingRouter
