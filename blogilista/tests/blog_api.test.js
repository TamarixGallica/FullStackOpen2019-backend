const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12
  }
]

const additionalBlogs = [
  {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
  }
]

const blogWithoutLikes = {
  title: "TDD harms architecture",
  author: "Robert C. Martin",
  url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
}

const blogWithoutTitle = {
  author: "Robert C. Martin",
  url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
  likes: 2,
}

const blogWithoutUrl =   {
  title: "Type wars",
  author: "Robert C. Martin",
  likes: 2,
}


beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('when blogs already exist in database', () => {
  describe('/api/blogs', () => {
    describe('get', () => {
      test('blogs are returned as json', async () => {
        await api
          .get('/api/blogs')
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })

      test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')

        expect(response.body.length).toBe(initialBlogs.length)
      })

      test('identifier is returned in id field', async () => {
        const response = await api.get('/api/blogs')

        expect(response.body[0].id).toBeDefined()
      })

      test('zero likes is returned if not set in database', async () => {
        const newBlog = new Blog(blogWithoutLikes)

        await newBlog.save()

        const result = await api.get('/api/blogs')
        const blogs = result.body

        blogs.forEach((blog) => {
          expect(blog.likes).toBeGreaterThanOrEqual(0)
        })
      })
    })

    describe('post', () => {
      test('added blog is returned as json', async () => {
        await api
          .post('/api/blogs')
          .send(additionalBlogs[0])
          .expect(201)
          .expect('Content-Type', /application\/json/)
      })

      test('properties for added blogs match', async () => {
        const response = await api.post('/api/blogs').send(additionalBlogs[0])

        const blog = response.body

        expect(blog.title).toBe(additionalBlogs[0].title)
        expect(blog.author).toBe(additionalBlogs[0].author)
        expect(blog.url).toBe(additionalBlogs[0].url)
        expect(blog.likes).toBe(additionalBlogs[0].likes)
        expect(blog.id).toBeDefined()
      })

      test('number of blogs increases when new blog is added', async () => {
        const originalCount = (await api.get('/api/blogs')).body.length
        await api.post('/api/blogs').send(additionalBlogs[0])
        const newCount = (await api.get('/api/blogs')).body.length

        expect(newCount).toBe(originalCount + 1)
      })

      test('likes are set to zero if not defined when adding', async () => {
        const response = await api.post('/api/blogs').send(blogWithoutLikes)
        
        const blog = response.body

        expect(blog.likes).toBe(0)
      })

      test('returns 400 when title is not set', async () => {
        await api.post('/api/blogs').send(blogWithoutTitle)
          .expect(400)
      })

      test('returns 400 when url is not set', async () => {
        await api.post('/api/blogs').send(blogWithoutUrl)
          .expect(400)
      })
    })

    describe('update', () => {
      test('returns 404 when blog to be updated is not found', async () => {
        const blog = await Blog.findOne({})
        await blog.remove()
        await api.patch(`/api/blogs/${blog._id}`)
          .expect(404)
      })

      test('returns 200 when number of likes for blog has been updated successfully', async () => {
        const blog = await Blog.findOne({})
        await api.patch(`/api/blogs/${blog._id}`)
          .expect(200)
      })

      test('number of likes has been updated', async () => {
        const blog = await Blog.findOne({})
        const response = await api.patch(`/api/blogs/${blog._id}`).send({likes: blog.likes + 3})
        expect(response.body.likes).toBe(blog.likes + 3)
      })
    })

    describe('delete', () => {
      test('returns 404 when blog with specified id is not found', async () => {
        const blog = await Blog.findOne({})
        await blog.remove()
        await api.delete(`/api/blogs/${blog._id}`)
          .expect(404)
      })

      test('number of blogs decreases when a blog is deleted', async () => {
        const blogToDelete = await Blog.findOne({})

        const originalCount = await Blog.countDocuments({})

        await api.delete(`/api/blogs/${blogToDelete._id}`)

        const newCount = await Blog.countDocuments({})

        expect(newCount).toBe(originalCount - 1)
      })

      test('returns 204 on successful deletion', async () => {
        const blogToDelete = await Blog.findOne({})

        await api.delete(`/api/blogs/${blogToDelete._id}`)
          .expect(204)
      })
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})