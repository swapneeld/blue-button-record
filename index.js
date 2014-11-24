"use strict";

var db = require('./lib/db');
var storage = require('./lib/storage');
var merge = require('./lib/merge');
var match = require('./lib/match');
var section = require('./lib/section');
var entry = require('./lib/entry');
var allsections = require('./lib/allsections');
var modelutil = require('./lib/modelutil');

// db

var dbinfo = null;

exports.connectDatabase = function connectDatabase(server, options, callback) {
    if (!callback) {
        callback = options;
        options = {};
    }
    if (!dbinfo) {
        db.connect(server, options, function (err, result) {
            if (err) {
                callback(err);
            } else {
                dbinfo = result;
                callback(null, dbinfo);
            }
        });
    }
};

exports.disconnect = function (callback) {
    if (dbinfo) {
        dbinfo.connection.close(function (err) {
            dbinfo = null;
            callback(err);
        });
    }
};

exports.clearDatabase = function (callback) {
    if (dbinfo) {
        dbinfo.dropCollections(callback);
    }
};

// records

exports.saveSource = function (ptKey, content, sourceInfo, contentType, callback) {
    storage.saveSource(dbinfo, ptKey, content, sourceInfo, contentType, callback);
};

exports.getSourceList = function (ptKey, callback) {
    storage.getSourceList(dbinfo, ptKey, callback);
};

exports.updateSource = function (ptKey, sourceId, update, callback) {
    storage.updateSource(dbinfo, ptKey, sourceId, update, callback);
};

exports.getSource = function (ptKey, sourceId, callback) {
    storage.getSource(dbinfo, ptKey, sourceId, callback);
};

exports.sourceCount = function (ptKey, callback) {
    storage.sourceCount(dbinfo, ptKey, callback);
};

// merges

exports.getMerges = function (secName, ptKey, entryFields, recordFields, callback) {
    merge.getAll(dbinfo, secName, ptKey, entryFields, recordFields, callback);
};

exports.mergeCount = function (secName, ptKey, conditions, callback) {
    merge.count(dbinfo, secName, ptKey, conditions, callback);
};

// matches

exports.saveMatches = function (secName, ptKey, inputSection, sourceId, callback) {
    section.savePartial(dbinfo, secName, ptKey, inputSection, sourceId, callback);
};

exports.getMatches = function (secName, ptKey, fields, callback) {
    match.getAll(dbinfo, secName, ptKey, fields, callback);
};

exports.getMatch = function (secName, ptKey, id, callback) {
    match.get(dbinfo, secName, ptKey, id, callback);
};

exports.matchCount = function (secName, ptKey, conditions, callback) {
    match.count(dbinfo, secName, ptKey, conditions, callback);
};

exports.cancelMatch = function (secName, ptKey, id, reason, callback) {
    match.cancel(dbinfo, secName, ptKey, id, reason, callback);
};

exports.acceptMatch = function (secName, ptKey, id, reason, callback) {
    match.accept(dbinfo, secName, ptKey, id, reason, callback);
};

// section

exports.getSection = function (secName, ptKey, callback) {
    section.get(dbinfo, secName, ptKey, callback);
};

exports.saveSection = function (secName, ptKey, inputSection, sourceId, callback) {
    section.save(dbinfo, secName, ptKey, inputSection, sourceId, callback);
};

exports.getAllSections = function (ptKey, callback) {
    allsections.get(dbinfo, ptKey, callback);
};

exports.saveAllSections = function (ptKey, ptRecord, sourceId, callback) {
    allsections.save(dbinfo, ptKey, ptRecord, sourceId, callback);
};

// entry

exports.getEntry = function (secName, ptKey, id, callback) {
    entry.get(dbinfo, secName, ptKey, id, callback);
};

exports.updateEntry = function (secName, ptKey, id, sourceId, updateObject, callback) {
    entry.update(dbinfo, secName, ptKey, id, sourceId, updateObject, callback);
};

exports.duplicateEntry = function (secName, ptKey, id, sourceId, callback) {
    entry.duplicate(dbinfo, secName, ptKey, id, sourceId, callback);
};

// utility

exports.cleanSection = function (input) {
    return modelutil.mongooseToBBModelSection(input);
};

// PIM query
exports.getCandidates = function (ptInfo, callback) {
    pim.get(dbinfo, ptInfo, callback);
};

