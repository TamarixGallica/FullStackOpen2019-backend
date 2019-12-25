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
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})