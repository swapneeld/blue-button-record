"use strict";

var record = require('../../index.js');

var chai = require('chai');
var async = require('async');

var assert = require('assert');

var db = require('../../lib/db');
var modelutil = require('../../lib/modelutil');

var expect = chai.expect;
chai.config.includeStack = true;

var dbinfo = {};

describe('medications.js methods', function () {

    before(function (done) {
        var options = {
            dbName: 'dre-medications-test',
            supported_sections: ['allergies', 'procedures', 'medications']
        };

        dbinfo = record.connectDatabase('localhost', options, function (err) {
            //assert.ifError(err);

            done();

        });

    });

    it('add medication', function (done) {
        var med = {
            "identifiers": [{
                "identifier": "cdbd33f0-6cde-11db-9fe1-0800200c9a66"
            }],
            "status": "Completed",
            "sig": "Proventil HFA",
            "product": {
                "identifiers": [{
                    "identifier": "2a620155-9d11-439e-92b3-5d9815ff4ee8"
                }],
                "unencoded_name": "Proventil HFA",
            }
        };

        record.addMedication("username", med, function (err, data) {
            expect(data._id).to.exist;
            expect(data.pat_key).to.exist;
            expect(data.data).to.exist;

            done();
        });

    });

    it('add and edit medication', function (done) {
        var med = {
            "identifiers": [{
                "identifier": "cdbd33f0-6cde-11db-9fe1-0800200c9a67"
            }],
            "status": "Completed",
            "sig": "Proventil2 HFA",
            "product": {
                "identifiers": [{
                    "identifier": "2a620155-9d11-439e-92b3-5d9815ff4ee7"
                }],
                "unencoded_name": "Proventil2 HFA",
            }
        };

        record.addMedication("username", med, function (err, data) {
            expect(data._id).to.exist;
            expect(data.pat_key).to.exist;
            expect(data.data.sig).to.equal("Proventil2 HFA");

            var id = data._id;
            data.data.sig = "Take once a day.";

            record.editMedication("username", id, data.data, function (err, data) {
                expect(data._id).to.exist;
                expect(data.pat_key).to.exist;
                expect(data.data.sig).to.equal("Take once a day.");

                done();
            });
        });

    });

    it('get medications', function (done) {
        //record.
        record.getAllMedications("username", function (err, data) {

            expect(data).to.exist;
            expect(data).to.have.length(2);

            done();

        });

    });

    it('add and delete medication', function (done) {
        //record.

        record.getAllMedications("username", function (err, data) {

            expect(data).to.exist;
            expect(data).to.have.length(2);

            var med = {
                "identifiers": [{
                    "identifier": "cdbd33f0-6cde-11db-9fe1-0800200c9a68"
                }],
                "status": "Completed",
                "sig": "Delete me!",
                "product": {
                    "identifiers": [{
                        "identifier": "2a620155-9d11-439e-92b3-5d9815ff4ee8"
                    }],
                    "unencoded_name": "Proventil3 HFA",
                }
            };

            record.addMedication("username", med, function (err, data) {
                expect(data._id).to.exist;
                expect(data.pat_key).to.exist;
                expect(data.data.sig).to.equal("Delete me!");

                var id = data._id;

                record.getAllMedications("username", function (err, data) {

                    expect(data).to.exist;
                    expect(data).to.have.length(3);

                    record.deleteMedication("username", id, function (err, data) {
                        expect(err).to.be.null;

                        record.getAllMedications("username", function (err, data) {

                            expect(data).to.exist;
                            expect(data).to.have.length(2);

                            done();
                        });
                    });
                });
            });

        });

    });

    after(function (done) {
        record.clearDatabase(function (err) {
            record.disconnect(function (err) {
                done(err);
            });
        });
    });

});
