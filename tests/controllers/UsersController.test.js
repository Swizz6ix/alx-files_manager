/* eslint-disable linebreak-style */
/* eslint-disable jest/valid-expect */
import { expect, before } from 'chai';
import request from 'request';
import dbClient from '../../utils/db';

describe('userController', () => {
  const mockUser = {
    email: 'moses@mail.com',
    password: 'password12345',
  };

  before((done) => {
    this.timeout(10000);
    dbClient.usersCollection()
      .then((usersCollection) => {
        usersCollection.deleteMany({ email: mockUser.email })
          .then(() => done())
          .catch((deleteErr) => done(deleteErr));
      }).catch((connectErr) => done(connectErr));
    setTimeout(done, 5000);
  });

  describe('post /users', () => {
    it('fails when there is no email and there is password', () => new Promise((done) => {
      this.timeout(5000);
      request.post('/users')
        .send({
          password: mockUser.password,
        })
        .expect(400)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.equal({ error: 'Missing email' });
          return done();
        });
    }));

    it('succeeds when the new user has a password and email', () => new Promise((done) => {
      this.timeout(5000);
      request.post('/users')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.email).to.equal(mockUser.email);
          expect(res.body.id.length).to.be.greaterThan(0);
          return done();
        });
    }));
    it('fails when the user already exists', () => new Promise((done) => {
      this.timeout(5000);
      request.post('/users')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        })
        .expect(400)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.equal({ error: 'Already exist' });
          return done();
        });
    }));
  });
});
