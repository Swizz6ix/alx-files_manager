/* eslint-disable jest/valid-expect */
/* eslint-disable linebreak-style */
/* eslint-disable jest/prefer-expect-assertions */

import { expect, before } from 'chai';
import redisClient from '../../utils/redis';

describe('redisClient utility', () => {
  before((done) => {
    this.timeout(10000);
    setTimeout(done, 4000);
  });

  it('client is alive', () => {
    expect(redisClient.isAlive()).to.be.equal(true);
  });

  it('setting and getting a value', async () => {
    await redisClient.set('test_key', 345, 10);
    expect(redisClient.get('test_key')).to.be.equal('345');
  });

  it('setting and getting an expired value', async () => {
    await redisClient.set('test_key', 356, 1);
    setTimeout(async () => {
      expect(redisClient.get('test_key')).to.not.equal('356');
    }, 2000);
  });

  it('setting and getting a deleted value', async () => {
    await redisClient.set('test_key', 345, 10);
    await redisClient.del('test_key');
    setTimeout(async () => {
      console.log('del: test_key ->', redisClient.get('test_key'));
      expect(redisClient.get('test_key')).to.be.null;
    }, 2000);
  });
});
