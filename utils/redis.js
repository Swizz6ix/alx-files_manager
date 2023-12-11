/* eslint-disable linebreak-style */
import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  /**
   * The constructor that creates a client to Redis
   */
  constructor() {
    this.client = createClient();
    this.client.on('error', (error) => {
      console.log(`Redis client not connected to server: ${error}`);
    });
  }

  /**
   * A function that returns true when the connection to Redis is a success otherwise, false
   * @returns {boolean}
   */
  isAlive() {
    if (this.client.connected) {
      return true;
    }
    return false;
  }

  /**
   * An asynchronous function get that takes a string key as argument
   * and returns the Redis value stored for this key
   * @param {string} key
   * @returns {string} redis Value
   */
  async get(key) {
    const redisGet = promisify(this.client.get).bind(this.client);
    const value = await redisGet(key);
    return value;
  }

  /**
   * An asynchronous function that takes a string key,
   * a value and a duration in second as arguments
   * to store it in Redis (with an expiration set by the duration argument
   * @param {String} key
   * @param {String} value
   * @param {String} time
   */
  async set(key, value, time) {
    const redisSet = promisify(this.client.set).bind(this.client);
    await redisSet(key, value);
    await this.client.expire(key, time);
  }

  /**
   * An asynchronous function that takes a string key as argument
   * and remove the value in Redis for this key
   * @param {string} key
   */
  async del(key) {
    const redisDel = promisify(this.client.del).bind(this.client);
    await redisDel(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
