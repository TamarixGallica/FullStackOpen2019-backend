require('dotenv').config()

let PORT = process.env.PORT || 3003
let MONGO_URI = process.env.MONGO_URI
let SECRET = process.env.SECRET
let SALTROUNDS = parseInt(process.env.SALTROUNDS)

if (process.env.NODE_ENV === 'test') {
    MONGO_URI = process.env.TEST_MONGO_URI
}

module.exports = {
    PORT,
    MONGO_URI,
    SECRET,
    SALTROUNDS,
}
