/* eslint-disable linebreak-style */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/prefer-expect-assertions */
import { expect, before } from 'chai';
import dbClient from '../../utils/db';

describe('dbclient utility', () => {
  before((done) => {
    this.timeout(10000);
    Promise.all([dbClient.usersCollection(), dbClient.filesCollection()])
      .then(([usersCollection, filesCollection]) => {
        Promise.all([usersCollection.deleteMany({}), filesCollection.deleteMany({})])
          .then(() => done())
          .catch((deleteErr) => done(deleteErr));
      }).catch((connectErr) => done(connectErr));
  });

  it('client is alive', () => {
    expect(dbClient.isAlive()).to.be.equal(true);
  });

  it('nbUsers returns the correct value', async () => {
    expect(await dbClient.nbUsers()).to.equal(0);
  });

  it('nbFiles returns the correct value', async () => {
    expect(await dbClient.nbFiles()).to.equal(0);
  });
});
