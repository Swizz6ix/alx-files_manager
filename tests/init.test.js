/* eslint-disable linebreak-style */
import supertest from 'supertest';
import chai from 'chai';
import api from '../server';

global.app = api;
global.request = supertest(api);
global.expect = chai.request;
global.assert = chai.assert;
