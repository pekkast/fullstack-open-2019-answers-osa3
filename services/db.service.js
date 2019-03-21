const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = document._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Person = mongoose.model('Person', personSchema);

const create = async ({ name, number }) => await Person.create({ name, number });
const update = async ({ id, number }) => await Person.findByIdAndUpdate(id, { number });
const remove = async id => await Person.findByIdAndDelete(id);

const getAll = async () => {
  const response = await Person.find();
  return response.map(p => p.toJSON());
}

const getOne = async id => {
  const person = await Person.findById(id);
  return person && person.toJSON();
}

const findByName = async name => {
  const response = await Person.findOne({ name });
  return response && response.toJSON();
}

module.exports = { getAll, getOne, update, create, remove, findByName };
