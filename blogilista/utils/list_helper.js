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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}