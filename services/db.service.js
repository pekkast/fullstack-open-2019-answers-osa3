const fs = require('fs');

const connection = 'data/persons.json';

const getAll = (callback, failure) => {
  fs.readFile(connection, (err, data) => {
    if (err && failure) {
      return failure(err);
    }
    return callback(data);
  });
};

const update = (data, failure) => {
  fs.writeFile(connection, JSON.stringify(data), (err) => {
    if (err && failure) {
      failure(err);
    }
  });
};

module.exports = { getAll, update };
