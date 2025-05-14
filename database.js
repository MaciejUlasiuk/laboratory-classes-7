const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const { DB_USER, DB_PASS } = require('./config');

let database;

const mongoConnect = (callback) => {
  const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.6akmb2b.mongodb.net/shop?retryWrites=true&w=majority`.replace("<username>", DB_USER).replace("<password>", DB_PASS);
  MongoClient.connect(uri)
    .then(client => {
      console.log('Connection to the database has been established.');
      database = client.db('shop');
      callback();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDatabase = () => {
  if (database) {
    return database;
  }
  throw 'No database found.';
};

module.exports = {
  mongoConnect,
  getDatabase
};