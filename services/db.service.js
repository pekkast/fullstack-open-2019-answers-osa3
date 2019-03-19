const mongoose = require('mongoose');

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

const create = async ({ name, number }) => {
  const response = await Person
    .create({ name, number });
  console.log('create', response);
  return response;
};

const update = async ({ id, number }) => {
  const response = await Person
    .findByIdAndUpdate(id, { number });
  console.log('update', response);
  return response;
};

const remove = async id => {
  const response = await Person
    .findByIdAndDelete(id);
  console.log('remove', response);
  return response;
};

const getAll = async () => {
  const response = await Person
    .find();
  console.log('getall', response);
  return response.map(p => p.toJSON());
}

const getOne = async id => {
  const response = { data: null, error: null };
  try {
    response.data = (await Person.findById(id)).toJSON();
  } catch (error) {
    response.error = {
      name: error.name,
      message: error.message,
      kind: error.kind,
      value: error.stringValue
    };

    console.error(response.error);
  }
  return response;
}

const findByName = async name => {
  const response = await Person
    .findOne({ name });
  console.log('findbyname', response);
  return response && response.toJSON();
}

module.exports = { getAll, getOne, update, create, remove, findByName };
