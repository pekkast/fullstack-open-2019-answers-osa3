require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./services/db.service');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
app.use(express.static('build'));
app.use(bodyParser.json());

// setup morgan to show post body
morgan.token('post-body', (req, res, field) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  }
  return '';
});
morgan.format('tiny', ':method :url :status :res[content-length] - :response-time ms :post-body')
app.use(morgan('tiny'));

const personExists = async name => !!await db.findByName(name);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/info', (req, res) => {
  res
    .type('text/plain')
    .send(`Puhelinluettelossa ${persons.length} henkilön tiedot.\n\n${new Date()}`);
});

app.get('/api/persons', async (req, res) => {
  res.json(await db.getAll());
});

app.get('/api/persons/:id', async (req, res) => {
  const id = req.params.id;
  const person = await db.getOne(id);
  if (person.error) {
    return res.status(400).json({ error: person.error });
  }
  if (!person.data) {
    return res.status(404).end();
  }
  res.json(person.data);
});

app.put('/api/persons/:id', async (req, res) => {
  const id = req.params.id;
  const current = await db.getOne(id);
  if (current.error) {
    return res.status(400).json({error: current.error});
  }
  if (!current.data) {
    return res.status(404).end();
  }
  await db.update({ id, number: req.body.number.trim() });
  res.status(204).end();
});

app.post('/api/persons', async (req, res) => {
  const data = req.body;
  const name = data.name.trim();
  const number = data.number.trim();

  if (!name) {
    return res.status(400).json({ error: 'Name must be given' });
  }

  if (!number) {
    return res.status(400).json({ error: 'Number must be given' });
  }

  if (await personExists(name)) {
    return res.status(400).json({ error: 'Name must be unique' });
  }

  const person = await db.create({ name, number });
  res
    .status(201)
    .location(`/api/persons/${person.id}`)
    .end();
});

app.delete('/api/persons/:id', async (req, res) => {
  const id = req.params.id;
  if ((await db.getOne(id)).data) {
    await db.remove(id);
  }
  // DELETE Should be idempotent, hence always 204
  res.status(204).end();
});


const port = process.env.PORT;
const startServer = () => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

const mongoUrl = process.env.MONGODB_URI;
const connect = () => {
  mongoose.connection
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', startServer);
  return mongoose.connect(mongoUrl, { keepAlive: 1, useNewUrlParser: true });
}

connect();
