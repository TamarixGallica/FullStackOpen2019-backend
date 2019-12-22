const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }
  
  return blogs.reduce(reducer, 0);
}

const favoriteBlog = (blogs) => {
  const compareLikes = (a, b) => a.likes - b.likes

  if (blogs.length === 0) {
    return null;
  }

  const copyBlogs = blogs.concat()
  copyBlogs.sort(compareLikes)

  return copyBlogs.pop()
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const authorsByBlogCount = _.countBy(blogs, 'author')

  const authorByBlogArr = []

  _.forEach(authorsByBlogCount, (value, key) => {
    authorByBlogArr.push({
      author: key,
      blogs: value
    })
  })

  const result = _.sortBy(authorByBlogArr, 'blogs')

  return result.pop()
}

const mostLikes = (blogs) => {
  if(blogs.length === 0) {
    return null
  }

  const blogsByAuthor = _.groupBy(blogs, 'author')

  const blogsAndTotalLikes = []

  _.forEach(blogsByAuthor, (blogs, author) => {
    const authorAndLikes = {
      author: author,
      likes: _.sumBy(blogs, 'likes')
    }

    blogsAndTotalLikes.push(authorAndLikes)
  })

  return _.sortBy(blogsAndTotalLikes, (object) => object.likes).pop()
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}