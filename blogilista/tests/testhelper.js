const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')
const config = require('../utils/config')

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    comments: [
      "Fascinating stuff!",
      "Beats sleeping pills easily"
    ]
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
    comments: [
      "Seems like a first world problem"
    ]
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

const initialUsers = [
  {
    username: 'root',
    name: 'Squareroot of all evil',
    password: 'loremipsum'
  },
  {
    username: 'briankottarainen',
    name: 'Brian Kottarainen',
    password: 'iddqdidkfa'
  }
]

const newUser = {
  username: 'britakottarainen',
  name: 'Brita Kottarainen',
  password: 'tinstafl'
}

const initializeTestData = async () => {
  await User.deleteMany({})

  const userObjects = await Promise.all(initialUsers
    .map(async user => {
      const { password, ...newUser } = user
      newUser.passwordHash = await bcrypt.hash(password, config.SALTROUNDS);
      return new User(newUser)
    })
  )
  const userPromiseArray = userObjects.map(user => user.save())
  const addedUsers = await Promise.all(userPromiseArray)

  await Blog.deleteMany({})

  const blogObjects = initialBlogs
    .map(blog => {
      const blogObject = new Blog(blog)
      blogObject.user = addedUsers[0].id
      return new Blog(blogObject)
    })
  const blogPromiseArray = blogObjects.map(blog => blog.save())
  const addedBlogs = await Promise.all(blogPromiseArray)

  addedUsers[0].blogs = addedBlogs.map(blog => blog.id)

  await addedUsers[0].save()
}

const createAuthenticationHeader = (header) => `Bearer ${header}`

module.exports = {
  initialBlogs,
  additionalBlogs,
  blogWithoutLikes,
  blogWithoutTitle,
  blogWithoutUrl,
  initialUsers,
  newUser,
  initializeTestData,
  createAuthenticationHeader,
}