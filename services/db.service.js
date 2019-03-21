const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const personSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, minlength: 3 },
  number: { type: String, required: true, minlength: 8 },
});
personSchema.plugin(uniqueValidator);

personSchema.set('toJSON', {
  transform: doc => ({
    // eslint-disable-next-line no-underscore-dangle
    id: doc._id.toString(),
    name: doc.name,
    number: doc.number,
  }),
});

const Person = mongoose.model('Person', personSchema);

const create = async ({ name, number }) => Person.create({ name, number });
const update = async ({ id, number }) => Person.findByIdAndUpdate(id, { number }, { runValidators: true, context: 'query' });
const remove = async id => Person.findByIdAndDelete(id);

const getAll = async () => {
  const response = await Person.find();
  return response.map(p => p.toJSON());
};

const getOne = async (id) => {
  const person = await Person.findById(id);
  return person && person.toJSON();
};

const findByName = async (name) => {
  const response = await Person.findOne({ name });
  return response && response.toJSON();
};

module.exports = { getAll, getOne, update, create, remove, findByName };
