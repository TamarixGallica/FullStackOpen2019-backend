const Blog = require('../models/blog')
const User = require('../models/user')

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

const initializeTestData = async () => {
  await User.deleteMany({})

  const userObjects = initialUsers
    .map(user => new User(user))
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

module.exports = {
  initialBlogs,
  additionalBlogs,
  blogWithoutLikes,
  blogWithoutTitle,
  blogWithoutUrl,
  initialUsers,
  newUser,
  initializeTestData,
}