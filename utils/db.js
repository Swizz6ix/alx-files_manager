/* eslint-disable linebreak-style */
import { MongoClient } from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || '27017';
const DATABASE = process.env.DB_DATABASE || 'file_manager';
const url = `mongodb://${HOST}:${PORT}`;

class DBclient {
  /**
   * The constructor that creates a client to MongoDB
   */
  constructor() {
    this.client = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true });
    this.client.connect().then(() => {
      this.db = this.client.db(`${DATABASE}`);
    }).catch((err) => {
      console.log(err);
    });
  }

  /**
   * A function that returns true when the connection to MongoDB is a success otherwise, false
   * @returns {boolean}
   */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * An asynchronous that returns the number of documents in the collection users
   * @returns
   */
  async nbUsers() {
    const users = this.db.collection('users');
    const usersNum = await users.countDocuments();
    return usersNum;
  }

  /**
   * An asynchronous function nbUsers that returns the number of documents in the collection files
   * @returns
   */
  async nbFiles() {
    const files = this.db.collection('files');
    const filesNum = await files.countDocuments();
    return filesNum;
  }
}

const dbClient = DBclient();

module.exports = dbClient;
