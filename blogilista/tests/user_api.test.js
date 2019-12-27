const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
// const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

const initialUsers = [
  {
    username: 'root',
    name: 'Squareroot of all evil',
    passwordHash: 'loremipsum'
  },
  {
    username: 'briankottarainen',
    name: 'Brian Kottarainen',
    passwordHash: 'iddqdidkfa'
  }
]

const newUser = {
  username: 'britakottarainen',
  name: 'Brita Kottarainen',
  password: 'tinstafl'
}

beforeEach(async () => {
  await User.deleteMany({})

  const userObjects = initialUsers
    .map(user => new User(user))
  const promiseArray = userObjects.map(user => user.save())
  await Promise.all(promiseArray)
})

describe('/api/users', () => {
  describe('get', () => {
    test('returned number of users matches saved data', async () => {
      const result = await api.get('/api/users')
      const users = result.body

      const userCount = await User.countDocuments({})

      expect(users.length).toBe(userCount)
    })

    test('returned user properties matches saved data', async () => {
      const result = await api.get('/api/users')
      const users = result.body

      const usersInDb = await User.find({})

      while(user = users.pop()) {
        userInDb = usersInDb.pop()
        expect(user.id).toBe(userInDb._id.toString())
        expect(user.username).toBe(userInDb.username)
        expect(user.name).toBe(userInDb.name)
      }
    })
  })

  describe('post', () => {
    test('number of users increases when new user is added', async () => {
      const originalCount = await User.countDocuments({})

      await api.post('/api/users').send(newUser)

      const newCount = await User.countDocuments({})

      expect(newCount).toBe(originalCount + 1)
    })

    test('user properties are returned when user is added', async () => {
      const result = await api.post('/api/users').send(newUser)

      const user = result.body

      expect(user.username).toBe(newUser.username)
      expect(user.name).toBe(newUser.name)
      expect(user.id).toBeDefined()
    })

    test('user id is returned in id property instead of _id', async () => {
      const result = await api.post('/api/users').send(newUser)

      const user = result.body

      expect(user.id).toBeDefined()
      expect(user._id).toBeUndefined()
    })

    test('password hash is not returned when user is added', async () => {
      const result = await api.post('/api/users').send(newUser)

      const user = result.body

      expect(user.passwordHash).toBeUndefined()
    })

    test('password is hashed when user is added', async () => {
      const result = await api.post('/api/users').send(newUser)

      const user = result.body

      const userInDb = await User.findById(user.id)

      expect(userInDb.passwordHash).toBeDefined()
    })

    test('returns 400 if username is not specified', async () => {
      await api.post('/api/users').send({
        name: newUser.name,
        password: newUser.password
      })
        .expect(400)
    })

    test('returns 400 if password is not specified', async () => {
      await api.post('/api/users').send({
        username: newUser.username,
        name: newUser.name
      })
        .expect(400)
    })

    test('returns 400 if password is too short', async () => {
      await api.post('/api/users').send({
        username: newUser.username,
        name: newUser.name,
        password: '12'
      })
        .expect(400)
    })

    test('returns 400 if user with the same username already exists', async () => {
      await api.post('/api/users').send(newUser)
      await api.post('/api/users').send(newUser)
        .expect(400)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})