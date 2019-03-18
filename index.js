const express = require('express');
const bodyParser = require('body-parser');
const db = require('./data/db.service');

const app = express();
app.use(bodyParser.json());

let persons = [];

// TODO fix this nonsense id generation
// +1 is to prevent id = 0
const getNextId = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + 1;
const personExists = (name) => persons.findIndex(p => p.name === name) !== -1;

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
  persons[idx].name = name.trim();
  persons[idx].number = number.trim();
  res.status(204).end();
  db.update(persons);
});

app.post('/api/persons', (req, res) => {
  const data = req.body;
  const name = data.name.trim();
  const number = data.number.trim();

  if (!name) {
    return res.json(400, {error: 'Name must be given'});
  }

  if (!number) {
    return res.json(400, { error: 'Number must be given' });
  }

  if (personExists(name)) {
    return res.json(400, { error: 'Name must be unique' });
  }

  const person = {
    id: getNextId(),
    name,
    number
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
