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

app.get('/api', (req, res) => {
  res.redirect('/health');
});

app.get('/health', (req, res) => {
  res.send('Healthy');
});

app.get('/info', async (req, res) => {
  res
    .type('text/plain')
    .send(`Puhelinluettelossa ${(await db.getAll()).length} henkilön tiedot.\n\n${new Date()}`);
});

app.get('/api/persons', async (req, res) => {
  res.json(await db.getAll());
});

app.get('/api/persons/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    const person = await db.getOne(id);
    if (person) {
      return res.json(person);
    }
    res.status(404).end();
  } catch (ex) {
    next(ex);
  }
});

app.put('/api/persons/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await db.update({ id, number: req.body.number.trim() });
    if (result) {
      return res.status(204).end(); // PUT is idempotent - no content
    }
    res.status(404).end();
  } catch (ex) {
    await next(ex);
  }
});

app.post('/api/persons', async (req, res, next) => {
  const data = req.body;
  const name = data.name.trim();
  const number = data.number.trim();

  if (!name) {
    return res.status(400).json({ error: 'Name must be given' });
  }
  if (!number) {
    return res.status(400).json({ error: 'Number must be given' });
  }
  // Rely on uniqueValidator now on
  // if (await personExists(name)) {
  //   return res.status(400).json({ error: 'Name must be unique' });
  // }

  try {
    const person = await db.create({ name, number });
    res
      .status(201)
      .location(`/api/persons/${person.id}`)
      .end();
  } catch (ex) {
    next(ex);
  }
});

app.delete('/api/persons/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    await db.remove(id);
    // DELETE Should be idempotent, hence always 204
    res.status(204).end();
  } catch (ex) {
    next(ex);
  }
});

const castErrorHandler = (error, req, res, next) => {
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).json({ error: 'malformatted id' });
  }
  next(error);
};
app.use(castErrorHandler);

const validationErrorHandler = (error, req, res, next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  console.log('not handled', error);
  next(error);
};
app.use(validationErrorHandler);

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
