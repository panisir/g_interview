const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');

const app = require('../app');

const recordsController = require('../controllers/recordsController');

describe('Integration Tests', function() {
    this.timeout(10000);
    let templateReq = {
        "startDate": "2016-01-26",
        "endDate": "2018-02-02",
        "minCount": 2700,
        "maxCount": 3000
    };
    describe('## Get All Records ', function() {
        it('should return status code 200', function(done) {
            request(app) .post('/records/getAllRecords') .send(templateReq) .end(function(err, res) {
                expect(res.statusCode).to.equal(200);
                done();
            });
        });
    });

});