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

app.use(morgan('tiny'));

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.post('/api/persons', (req, res) => {
  const newPerson = req.body;

  if(!newPerson.name) {
    return res.status(400).json({
      error: 'name may not be empty'
    })
  }

  if(!newPerson.number) {
    return res.status(400).json({
      error: 'number may not be empty'
    })
  }

  if(persons.find(person => person.name === newPerson.name)) {
    return res.status(400).json({
      error: 'name already exists'
    })
  };

  newPerson.id = Math.floor(Math.random()*10000);
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
