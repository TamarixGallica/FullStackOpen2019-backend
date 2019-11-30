const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');

let persons = [
    {
        name: 'Arto Hellas',
        number: '040-123456',
        id: 1
      },
      {
        name: 'Ada Lovelace',
        number: '39-44-5323523',
        id: 2
      },
      {
        name: 'Dan Abramov',
        number: '12-43-234345',
        id: 3
      },
      {
        name: 'Mary Poppendieck',
        number: '39-23-6423122',
        id: 4
      }
];

app.use(bodyParser.json());

morgan.token('person', (req, res) => JSON.stringify(req.body));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'));

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.post('/api/persons', (req, res) => {
  const {name, number} = req.body;
  console.log(name);

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

  if(persons.find(person => person.name === name)) {
    return res.status(400).json({
      error: 'name already exists'
    })
  };

  const id = Math.floor(Math.random()*10000);
  const newPerson = {
    name,
    number,
    id
  };
  persons = persons.concat(newPerson);
  res.json(newPerson);
})

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const person = persons.find(person => person.id.toString() === id);
  if(person) {
    res.json(person);
  }
  else {
    res.status(404).end();
  }
});

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  if(persons.find(person => person.id.toString() === id)) {
    persons = persons.filter(person => person.id.toString() !== id);
    res.status(204).end();
  }
  else {
    res.status(404).end();
  }

})

app.get('/info', (req, res) => {
    res.send(
        `Phonebook has info for ${persons.length} people<br/><br/>
        ${new Date()}`
    );
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
