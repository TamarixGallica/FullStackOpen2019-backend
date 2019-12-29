const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const testhelper = require('./testhelper')

const api = supertest(app)

beforeEach(async () => {
  await testhelper.initializeTestData()
})

describe('when users already exist in database', () => {
  describe('/api/login', () => {
    describe('post', () => {
      beforeEach(async () => {
        await api.post('/api/users').send(testhelper.newUser)
      })

      test('login succeeds', async () => {
        await api
          .post('/api/login')
          .send(testhelper.newUser)
          .expect(200)
          .expect('Content-Type', /application\/json/)
      })

      test('successful login returns a token', async () => {
        const result = await api
          .post('/api/login')
          .send(testhelper.newUser)

        expect(result.body.token).toBeDefined()
      })
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})