const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})

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

  const result = await blog.save()

  return response.status(201).json(result)
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
