const express = require('express');
const bodyParser = require('body-parser');
const db = require('./data/db.service');

const app = express();
app.use(bodyParser.json());

let persons = [];

// as we add items to the end of array,
// the last item always has greatest id
const getNextId = () => persons.slice().pop().id + 1;

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/info', (req, res) => {
  res
    .type('text/plain')
    .send(`Puhelinluettelossa ${persons.length} henkilön tiedot.\n\n${new Date()}`);
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const id = +req.params.id;
  console.log(id, persons, req.params);
  const person = persons.find(person => person.id === id);
  if (!person) {
    return res.sendStatus(404);
  }
  res.json(person);
});

app.put('/api/persons/:id', (req, res) => {
  const id = +req.params.id;
  const idx = persons.findIndex(person => person.id === id);
  if (idx === -1) {
    return res.sendStatus(404);
  }
  const { name, number } = req.body;
  persons[idx].name = name;
  persons[idx].number = number;
  res.status(204).end();
  db.update(persons);
});

app.post('/api/persons', (req, res) => {
  const data = req.body;

  if (!data.name) {
    return res.json(400, 'Name must be given');
  }

  const person = {
    id: getNextId(),
    name: data.name,
    number: data.number
  };
  persons.push(person);
  res
    .status(201)
    .location(`/api/persons/${person.id}`)
    .end();
  db.update(persons);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = +req.params.id;
  const idx = persons.findIndex(person => person.id === id);
  if (idx === -1) {
    return res.sendStatus(404);
  }

  persons.splice(idx, 1);
  res.status(200).end();
  db.update(persons);
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  db.getAll((data) => {
    persons = JSON.parse(data);
    console.log(`Database includes ${persons.length} persons`);
  });
});
