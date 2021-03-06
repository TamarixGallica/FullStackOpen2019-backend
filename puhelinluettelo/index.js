const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())

app.use(bodyParser.json())

app.use(express.static('build'))

// eslint-disable-next-line no-unused-vars
morgan.token('person', (req, res) => JSON.stringify(req.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  console.log(error.name, error.kind)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  })
})

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body
  console.log(name)

  if(!name) {
    return res.status(400).json({
      error: 'name may not be empty'
    })
  }

  if(!number) {
    return res.status(400).json({
      error: 'number may not be empty'
    })
  }

  const newPerson = new Person({
    name,
    number,
  })

  newPerson.save()
    .then(savedPerson => {
      res.json(savedPerson.toJSON())
    })
    .catch(error => {
      next(error)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id)
    .then(person => { res.json(person.toJSON()) })
    .catch(error => {
      next(error)
    })

})

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  const body = req.body
  const person = {
    name: body.name,
    number: body.number
  }
  Person.findByIdAndUpdate(id, person, { new: true })
    .then(updatedPerson => { res.json(updatedPerson.toJSON()) })
    .catch(error => {
      next(error)
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id

  Person.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => {
      next(error)
    })
})

app.get('/info', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.send(
        `Phonebook has info for ${persons.length} people<br/><br/>
        ${new Date()}`
      )
    })
    .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
