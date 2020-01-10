const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const testhelper = require('./testhelper')

const api = supertest(app)

beforeEach(async () => {
  await testhelper.initializeTestData()
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

        expect(response.body.length).toBe(testhelper.initialBlogs.length)
      })

      test('identifier is returned in id field', async () => {
        const response = await api.get('/api/blogs')

        expect(response.body[0].id).toBeDefined()
      })

      test('zero likes is returned if not set in database', async () => {
        const newBlog = new Blog(testhelper.blogWithoutLikes)

        await newBlog.save()

        const result = await api.get('/api/blogs')
        const blogs = result.body

        blogs.forEach((blog) => {
          expect(blog.likes).toBeGreaterThanOrEqual(0)
        })
      })

      test('user details are returned for each blog', async () => {
        const response = await api.get('/api/blogs')

        const blogs = response.body

        blogs.forEach(blog => {
          expect(blog.user).toBeDefined()
          expect(blog.user.id).toBeDefined()
          expect(blog.user.username).toBeDefined()
          expect(blog.user.username).toBe(testhelper.initialUsers[0].username)
          expect(blog.user.name).toBeDefined()
          expect(blog.user.name).toBe(testhelper.initialUsers[0].name)
        })
      })

      test('blogs are not returned in user entries', async () => {
        const response = await api.get('/api/blogs')

        const blogs = response.body

        blogs.forEach(blog => expect(blog.user.blogs).toBeUndefined())
      })

      test('comments are returned for each blog', async () => {
        const response = await api.get('/api/blogs')

        const blogs = response.body

        blogs.forEach(blog => {
          expect(blog.comments).toBeDefined()
        })

        const firstBlog = blogs[0]
        expect(firstBlog.comments.length).toBe(2)
        expect(firstBlog.comments[0]).toBe(testhelper.initialBlogs[0].comments[0])
        expect(firstBlog.comments[1]).toBe(testhelper.initialBlogs[0].comments[1])
      })
    })

    describe('post', () => {
      test('adding a blog without a valid token returns 401', async () => {
        await api
          .post('/api/blogs')
          .send(testhelper.additionalBlogs[0])
          .expect(401)
          .expect('Content-Type', /application\/json/)
      })

      test('added blog is returned as json', async () => {
        const authResponse = await api.post('/api/login').send(testhelper.initialUsers[0])
        await api
          .post('/api/blogs')
          .send(testhelper.additionalBlogs[0])
          .set('Authorization', testhelper.createAuthenticationHeader(authResponse.body.token))
          .expect(201)
          .expect('Content-Type', /application\/json/)
      })

      test('properties for added blogs match', async () => {
        const authResponse = await api.post('/api/login').send(testhelper.initialUsers[0])

        const response = await api.post('/api/blogs').send(testhelper.additionalBlogs[0])
          .set('Authorization', testhelper.createAuthenticationHeader(authResponse.body.token))

        const blog = response.body

        expect(blog.title).toBe(testhelper.additionalBlogs[0].title)
        expect(blog.author).toBe(testhelper.additionalBlogs[0].author)
        expect(blog.url).toBe(testhelper.additionalBlogs[0].url)
        expect(blog.likes).toBe(testhelper.additionalBlogs[0].likes)
        expect(blog.id).toBeDefined()
        expect(blog.comments.length).toBe(testhelper.additionalBlogs[0].comments.length)
        expect(blog.comments[0]).toBe(testhelper.additionalBlogs[0].comments[0])
      })

      test('number of blogs increases when new blog is added', async () => {
        const authResponse = await api.post('/api/login').send(testhelper.initialUsers[0])

        let response = await api.get('/api/blogs')
          .set('Authorization', testhelper.createAuthenticationHeader(authResponse.body.token))
        const originalCount = response.body.length

        await api.post('/api/blogs').send(testhelper.additionalBlogs[0])
          .set('Authorization', testhelper.createAuthenticationHeader(authResponse.body.token))

        response = await api.get('/api/blogs')
          .set('Authorization', testhelper.createAuthenticationHeader(authResponse.body.token))

        const newCount = response.body.length

        expect(newCount).toBe(originalCount + 1)
      })

      test('likes are set to zero if not defined when adding', async () => {
        const authResponse = await api.post('/api/login').send(testhelper.initialUsers[0])

        const response = await api.post('/api/blogs').send(testhelper.blogWithoutLikes)
          .set('Authorization', testhelper.createAuthenticationHeader(authResponse.body.token))

        const blog = response.body

        expect(blog.likes).toBe(0)
      })

      test('user who added the blog is returned when adding', async () => {
        const authResponse = await api.post('/api/login').send(testhelper.initialUsers[0])

        const response = await api.post('/api/blogs').send(testhelper.additionalBlogs[0])
          .set('Authorization', testhelper.createAuthenticationHeader(authResponse.body.token))

        const blog = response.body

        expect(blog.user).toBeDefined()
        expect(blog.user.username).toBeDefined()
        expect(blog.user.name).toBeDefined()
        expect(blog.user.id).toBeDefined()
      })

      test('returns 400 when title is not set', async () => {
        const authResponse = await api.post('/api/login').send(testhelper.initialUsers[0])

        await api.post('/api/blogs').send(testhelper.blogWithoutTitle)
          .set('Authorization', testhelper.createAuthenticationHeader(authResponse.body.token))
          .expect(400)
      })

      test('returns 400 when url is not set', async () => {
        const authResponse = await api.post('/api/login').send(testhelper.initialUsers[0])

        await api.post('/api/blogs').send(testhelper.blogWithoutUrl)
          .set('Authorization', testhelper.createAuthenticationHeader(authResponse.body.token))
          .expect(400)
      })

      test('number of comments is increases when new comment is added', async () => {
        const blog = await Blog.findOne({})

        const response = await api.post(`/api/blogs/${blog.id}/comments`).send({comment: 'Test comment'})
          .expect(201)

        expect(response.body.comments.length).toBe(blog.comments.length + 1)
      })

      test('added comment is returned when new comment is added', async () => {
        const blog = await Blog.findOne({})

        const response = await api.post(`/api/blogs/${blog.id}/comments`).send({comment: 'Testy comment'})
          .expect(201)

        expect(response.body.comments.pop()).toBe('Testy comment')
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

      test('user details are returned when number of likes is updated', async () => {
        const blog = await Blog.findOne({})
        const response = await api.patch(`/api/blogs/${blog._id}`).send({likes: blog.likes + 3})
        expect(response.body.user).toBeDefined()
        expect(response.body.user.id).toBeDefined()
        expect(response.body.user.username).toBeDefined()
        expect(response.body.user.name).toBeDefined()
      })
    })

    describe('delete', () => {
      test('returns 404 when blog with specified id is not found', async () => {
        const authResponse = await api.post('/api/login').send(testhelper.initialUsers[0])

        const blog = await Blog.findOne({})
        await blog.remove()
        await api.delete(`/api/blogs/${blog._id}`)
          .set('Authorization', testhelper.createAuthenticationHeader(authResponse.body.token))
          .expect(404)
      })

      test('number of blogs decreases when a blog is deleted', async () => {
        const authResponse = await api.post('/api/login').send(testhelper.initialUsers[0])

        const blogToDelete = await Blog.findOne({})

        const originalCount = await Blog.countDocuments({})

        await api.delete(`/api/blogs/${blogToDelete._id}`)
          .set('Authorization', testhelper.createAuthenticationHeader(authResponse.body.token))

        const newCount = await Blog.countDocuments({})

        expect(newCount).toBe(originalCount - 1)
      })

      test('returns 204 on successful deletion', async () => {
        const authResponse = await api.post('/api/login').send(testhelper.initialUsers[0])

        const blogToDelete = await Blog.findOne({})

        await api.delete(`/api/blogs/${blogToDelete._id}`)
          .set('Authorization', testhelper.createAuthenticationHeader(authResponse.body.token))
          .expect(204)
      })

      test('returns 403 when user tries to delete a blog they haven\'t added', async () => {
        const authResponse = await api.post('/api/login').send(testhelper.initialUsers[1])

        const blogToDelete = await Blog.findOne({})
        await api.delete(`/api/blogs/${blogToDelete._id}`)
          .set('Authorization', testhelper.createAuthenticationHeader(authResponse.body.token))
          .expect(403)
      })
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})