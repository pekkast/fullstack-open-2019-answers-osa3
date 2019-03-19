const mongoose = require('mongoose');
const database = 'person-app';

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

const create = async (name, number) => {
  console.log(`lisätään ${name} numero ${number} luetteloon`);
  return await Person.create({ name, number });
};

const [program, file, password, name, number] = process.argv;
if (!password) {
  console.error('password not defined');
  process.exit(1);
}
const url =
  `mongodb+srv://fsc-db-usr:${password}@fullstackcourse-bs6zo.mongodb.net/${database}?retryWrites=true`;

const processData = async () => {
  if (name) {
    await create(name, number);
  } else {
    console.log('puhelinluettelo:');
    (await Person.find()).map(({ name, number }) => console.log(`${name} ${number}`));
  }

  mongoose.disconnect();
};

const connect = () => {
  mongoose.connection
    .on('error', console.log)
    .once('open', processData);
  return mongoose.connect(url, { keepAlive: 1, useNewUrlParser: true });
}

connect();
