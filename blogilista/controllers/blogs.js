const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const config = require('../utils/config')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', ['username', 'name', 'id'])

  return response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (request, response, next) => {

  try {
    const decodedToken = jwt.verify(request.token, config.SECRET)

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = new Blog(request.body)

    if(blog.likes === undefined) {
      blog.likes = 0
    }

    if(blog.title === undefined || blog.url === undefined) {
      return response.status(400).end()
    }

    const user = await User.findById(decodedToken.id)

    blog.user = user

    const result = await blog.save()

    user.blogs = user.blogs.concat(result._id)
    await user.save()


    return response.status(201).json(result)
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.patch('/:id', async (request, response) => {

  const blog = await Blog.findById(request.params.id)

  if (blog === null) {
    return response.status(404).end()
  }

  if (request.body.likes) {
    blog.likes = request.body.likes
  }

  try {
    await blog.save()
  }
  catch (exception) {
    console.log(exception)
    return response.status(500).json(exception.message)
  }

  const populatedBlog = await Blog.findById(blog.id).populate('user', ['username', 'name', 'id'])

  return response.status(200).send(populatedBlog.toJSON())
})

blogsRouter.delete('/:id', async (request, response) => {

  const decodedToken = jwt.verify(request.token, config.SECRET)

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(request.params.id)

  if (blog === null) {
    return response.status(404).end()
  }

  if (blog.user.toString() !== decodedToken.id) {
    return response.status(403).json({message: 'Can\t remove blogs added by other users'})
  }

  console.log(blog.user, decodedToken.id);

  try {
    await blog.remove()
  }
  catch (exception) {
    console.log(exception)
    return response.status(500).json(exception.message)
  }

  return response.status(204).end()
})

module.exports = blogsRouter
