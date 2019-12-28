const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')

  return response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  if(blog.likes === undefined) {
    blog.likes = 0
  }

  if(blog.title === undefined || blog.url === undefined) {
    return response.status(400).end()
  }

  blog.user = await User.findOne({})

  const result = await blog.save()

  return response.status(201).json(result)
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

  return response.status(200).send(blog.toJSON())
})

blogsRouter.delete('/:id', async (request, response) => {

  const blog = await Blog.findById(request.params.id)

  if (blog === null) {
    return response.status(404).end()
  }

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
