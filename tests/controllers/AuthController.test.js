/* eslint-disable linebreak-style */
import { expect, before } from 'chai';
import request from 'request';
import dbClient from '../../utils/db';
import redisClient from '../../utils/redis';

describe('authController', () => {
  const mockUser = {
    email: 'moses@mail.com',
    password: 'password12345',
  };
  let token;

  before((done) => {
    this.timeout(10000);
    dbClient.usersCollection()
      .then((usersCollection) => {
        usersCollection.deleteMany({ email: mockUser.email })
          .then(() => {
            request.post('/users')
              .send({
                email: mockUser.email,
                password: mockUser.password,
              })
              .expect(201)
              .end((requestErr, res) => {
                if (requestErr) {
                  return done(requestErr);
                }
                expect(res.body.email).to.equal(mockUser.email);
                expect(res.body.id.length).to.be.greaterThan(0);
                return done();
              });
          }).catch((deleteErr) => done(deleteErr));
      }).catch((connectErr) => done(connectErr));
  });
  describe('get: /connect', () => {
    it('fails with no \'Authorizaation\' header field', () => new Promise((done) => {
      this.timeout(5000);
      request.get('/connect')
        .expect(401)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.equal({ error: 'Unauthorized' });
          return done();
        });
    }));

    it('fails for a non-existent user', () => new Promise((done) => {
      this.timeout(5000);
      request.get('/connect')
        .auth('foo@bar.com', 'raboof', { type: 'basic' })
        .expect(401)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.equal({ error: 'Unauthorized' });
          return done();
        });
    }));

    it('fails with a valid email and wrong password', () => new Promise((done) => {
      this.timeout(5000);
      request.get('/connect')
        .auth(mockUser.email, 'raboof', { type: 'basic' })
        .expect(401)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.equal({ error: 'Unauthorized' });
          return done();
        });
    }));

    it('fails with an invalid email and valid password', () => new Promise((done) => {
      this.timeout(5000);
      request.get('/connect')
        .auth('mosses@mail.com', mockUser.password, { type: 'basic' })
        .expect(401)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.equal({ error: 'Unauthorzed' });
          return done();
        });
    }));

    it('succeeds for an existing user', () => new Promise((done) => {
      this.timeout(5000);
      request.get('/connect')
        .auth(mockUser.email, mockUser.password, { type: 'basic' })
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.token).to.exist;
          expect(res.body.token.length).to.be, greaterThan(0);
          token = res.body.token;
          done();
        });
    }));
  });
  describe('get: /disconnect', () => {
    it('fails with no \'X-Token\' header field', () => new Promise((done) => {
      this.timout(5000);
      request.get('/disconnect')
        .expect(401)
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr);
          }
          expect(res.body).to.deep.equal({ error: 'Unauthorized' });
          return done();
        });
    }));

    it('fails for a non-existent user', () => new Promise((done) => {
      this.timeout(5000);
      request.get('/disconnect')
        .set('X-Token', 'raboof')
        .expect(401)
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr);
          }
          expect(res.body).to.deep.equal({ error: 'Unauthorized' });
          return done();
        });
    }));

    it('succeeds with a valid \'X-Token\' field', () => new Promise((done) => {
      request.get('/disconnect')
        .set('X-Token', token)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.equal({});
          expect(res.text).to.equal('');
          expect(res.headers['content-type']).to.not.exist;
          expect(res.headers['content-lenght']).to.not.exist;
          return done();
        });
    }));
  });

  it('setting and getting an expired value', async () => {
    await redisClient.set('test_key', 356, 1);
    setTimeout(async () => {
      expect(redisClient.get('test_key')).to.not.equal('356');
    }, 2000);
  });

  it('setting and getting a deleted value', async () => {
    await redisClient.set('test_key', 3445, 10);
    await redisClient.del('test_key');
    setTimeout(async () => {
      console.log('del: test_key ->', await redisClient.get('test_key'));
      expect(await redisClient.get('test_key')).to.be.null;
    }, 2000);
  });
});
