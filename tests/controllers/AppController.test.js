/* eslint-disable linebreak-style */
/* eslint-disable jest/valid-expect */
import { expect, before } from 'chai';
import request from 'request';
import dbClient from '../../utils/db';

describe('appController', () => {
  before((done) => {
    this.timeout(10000);
    Promise.all([dbClient.usersCollection(), dbClient.filesCollection()])
      .then(([usersCollection, filesCollection]) => {
        Promise.all([usersCollection.deleteMany({}), filesCollection.deleteMany({})])
          .then(() => done())
          .catch((deleteErr) => done(deleteErr));
      }).catch((connectErr) => done(connectErr));
  });

  describe('get /status', () => {
    it('services are online', () => new Promise((done) => {
      request.get('/status')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.equal({ redis: true, db: true });
          return done();
        });
    }));
  });

  describe('get /stats', () => {
    it('services are online', () => new Promise((done) => {
      request.get('/stats')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.equal({ users: 0, files: 0 });
          return done();
        });
    }));

    it('correct statistics about db collection [alt]', () => new Promise((done) => {
      this.timeout(10000);
      Promise.all([dbClient.usersCollection(), dbClient.filesCollection()])
        .then(([usersCollection, filesCollection]) => {
          Promise.all([
            usersCollection.insertMany([{ email: 'moses@mail.com' }]),
            filesCollection.insertMany([
              { name: 'foo.txt', type: 'file' },
              { name: 'pic.png', type: 'image' },
            ]),
          ])
            .then(() => {
              request.get('/stats')
                .expect(200)
                .end((err, res) => {
                  if (err) {
                    return done(err);
                  }
                  expect(res.body).to.deep.equal({ users: 1, files: 2 });
                  return done();
                });
            }).catch((deleteErr) => done(deleteErr));
        }).catch((connectErr) => done(connectErr));
    }));
  });
});
