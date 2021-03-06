"use strict";
var bbr;
bbr = require('../../index');

describe('API Documentation Examples', function () {
    var assert;

    it('connectDatabase', function (done) {
        assert = require('assert');
        var options = {
            dbName: 'test-api',
            supported_sections: ['allergies', 'procedures']
        };
        bbr.connectDatabase('localhost', options, function (err) {
            assert.ifError(err);
            done();
        });
    });

    it('clearDatabase', function (done) {
        bbr.clearDatabase(function (err) {
            assert.ifError(err);
            done();
        });
    });

    var fileId1;
    var fileId2;
    var fileId3;
    var fileId4;

    it('saveSource (1)', function (done) {
        bbr.saveSource('testPatient1', '<content value=1 />', {
            type: 'text/xml',
            name: 'expl1.xml'
        }, 'ccda', function (err, id) {
            assert.ifError(err);
            fileId1 = id;
            done();
        });
    });

    it('saveSource (2)', function (done) {
        bbr.saveSource('testPatient1', '<content value=2 />', {
            type: 'application/xml',
            name: 'expl2.xml'
        }, 'c32', function (err, id) {
            assert.ifError(err);
            fileId2 = id;
            done();
        });
    });

    it('saveSource (3)', function (done) {
        bbr.saveSource('testPatient1', 'content 3', {
            type: 'text/plain',
            name: 'expl3.xml'
        }, 'ccda', function (err, id) {
            assert.ifError(err);
            fileId3 = id;
            done();
        });
    });

    it('saveSource (4)', function (done) {
        bbr.saveSource('testPatient2', '<content value=4 />', {
            type: 'text/xml',
            name: 'expl4.xml'
        }, 'ccda', function (err, id) {
            assert.ifError(err);
            fileId4 = id;
            done();
        });
    });

    it('updateSource', function (done) {
        var updateInfo = {
            'metadata.parsed': new Date(),
            'metadata.archived': new Date()
        };
        bbr.updateSource('testPatient1', fileId1, updateInfo, function (err) {
            assert.ifError(err);
            done();
        });
    });

    it('getSourceList', function (done) {
        bbr.getSourceList('testPatient1', function (err, sources) {
            assert.ifError(err);
            assert.equal(sources.length, 3);
            var names = sources.map(function (source) {
                return source.file_name;
            });
            var index = names.indexOf('expl1.xml');
            assert.equal(sources[index].file_mime_type, 'text/xml');
            assert.equal(sources[index].file_class, 'ccda');
            done();
        });
    });

    it('getSource', function (done) {
        bbr.getSource('testPatient1', fileId1, function (err, name, content) {
            assert.ifError(err);
            assert.equal(name, 'expl1.xml');
            assert.equal(content, '<content value=1 />');
            done();
        });
    });

    it('sourceCount', function (done) {
        bbr.sourceCount('testPatient1', function (err, count) {
            assert.ifError(err);
            assert.equal(count, 3);
            done();
        });
    });

    var aid1;
    var aid2;

    it('saveSection', function (done) {
        var inputSection = [{
            name: 'allergy1',
            severity: 'severity1',
            value: {
                code: 'code1',
                display: 'display1'
            }
        }, {
            name: 'allergy2',
            severity: 'severity2',
            value: {
                code: 'code2',
                display: 'display2'
            }
        }];

        bbr.saveSection('allergies', 'testPatient1', inputSection, fileId1, function (err, ids) {
            assert.ifError(err);
            aid1 = ids[0];
            aid2 = ids[1];
            done();
        });
    });

    it('getSection', function (done) {
        bbr.getSection('allergies', 'testPatient1', function (err, entries) {
            assert.ifError(err);
            var i = [entries[0].name, entries[1].name].indexOf('allergy1');
            assert.equal(entries[i].value.code, 'code1');
            var attr = entries[i].metadata.attribution[0];
            assert.equal(attr.merge_reason, 'new');
            assert.equal(attr.record.filename, 'expl1.xml');
            done();
        });
    });

    it('saveAllSections', function (done) {
        var ptRecord = {
            allergies: [{
                name: 'allergy1',
                severity: 'severity1',
            }, {
                name: 'allergy2',
                severity: 'severity2',
            }],
            procedures: [{
                name: 'procedure1',
                proc_type: 'proc_type1',
            }]
        };

        bbr.saveAllSections('testPatient2', ptRecord, fileId4, function (err, ids) {
            assert.ifError(err);
            assert(ids[0][0]); // id for 'allergy1'
            assert(ids[0][1]); // id for 'allergy2'
            assert(ids[1][0]); // id for 'procedure1'
            done();
        });
    });

    it('getAllSections', function (done) {
        bbr.getAllSections('testPatient2', function (err, ptRecord) {
            assert.ifError(err);
            var names = ptRecord.allergies.map(function (a) {
                return a.name;
            });
            var i = names.indexOf('allergy1');
            assert.equal(ptRecord.allergies[i].severity, 'severity1');
            assert.equal(ptRecord.procedures[0].name, 'procedure1');
            assert.equal(ptRecord.procedures[0].proc_type, 'proc_type1');
            var attr = ptRecord.procedures[0].metadata.attribution[0];
            assert.equal(attr.merge_reason, 'new');
            assert.equal(attr.record.filename, 'expl4.xml');
            done();
        });
    });

    it('cleanSection', function (done) {
        bbr.getSection('procedures', 'testPatient2', function (err, entries) {
            assert.ifError(err);
            var expectedCleanEntries = [{
                name: 'procedure1',
                proc_type: 'proc_type1',
            }];
            assert.notDeepEqual(entries, expectedCleanEntries);
            var cleanEntries = bbr.cleanSection(entries);
            assert.deepEqual(cleanEntries, expectedCleanEntries);
            done();
        });
    });

    it('getEntry', function (done) {
        bbr.getEntry('allergies', 'testPatient1', aid2, function (err, entry) {
            assert.ifError(err);
            assert.equal(entry.name, 'allergy2');
            assert.equal(entry.value.display, 'display2');
            var attr = entry.metadata.attribution[0];
            assert.equal(attr.merge_reason, 'new');
            assert.equal(attr.record.filename, 'expl1.xml');
            done();
        });
    });

    it('duplicateEntry', function (done) {
        bbr.duplicateEntry('allergies', 'testPatient1', aid1, fileId2, function (err) {
            assert.ifError(err);
            bbr.getEntry('allergies', 'testPatient1', aid1, function (err, entry) {
                assert.ifError(err);
                var attr = entry.metadata.attribution;
                assert.equal(attr.length, 2);
                assert.equal(attr[0].merge_reason, 'new');
                assert.equal(attr[0].record.filename, 'expl1.xml');
                assert.equal(attr[1].merge_reason, 'duplicate');
                assert.equal(attr[1].record.filename, 'expl2.xml');
                done();
            });
        });
    });

    it('updateEntry', function (done) {
        bbr.updateEntry('allergies', 'testPatient1', aid1, fileId3, {
            severity: 'updatedSev'
        }, function (err) {
            assert.ifError(err);
            bbr.getEntry('allergies', 'testPatient1', aid1, function (err, entry) {
                assert.ifError(err);
                assert.equal(entry.severity, 'updatedSev');
                var attr = entry.metadata.attribution;
                assert.equal(attr.length, 3);
                assert.equal(attr[0].merge_reason, 'new');
                assert.equal(attr[0].record.filename, 'expl1.xml');
                assert.equal(attr[1].merge_reason, 'duplicate');
                assert.equal(attr[1].record.filename, 'expl2.xml');
                assert.equal(attr[2].merge_reason, 'update');
                assert.equal(attr[2].record.filename, 'expl3.xml');
                done();
            });
        });
    });

    it('getMerges', function (done) {
        bbr.getMerges('allergies', 'testPatient1', 'name severity', 'filename', function (err, result) {
            assert.ifError(err);
            assert.equal(result.length, 4);
            result.sort(function (a, b) {
                var r = a.entry.name.localeCompare(b.entry.name);
                if (r === 0) {
                    var c = {
                        'new': -1,
                        'duplicate': 0,
                        'update': 1
                    };
                    return c[a.merge_reason] - c[b.merge_reason];
                }
                return r;
            });
            assert.equal(result[0].entry.severity, 'updatedSev');
            assert.equal(result[0].record.filename, 'expl1.xml');
            assert.equal(result[0].merge_reason, 'new');
            assert.equal(result[1].entry.severity, 'updatedSev');
            assert.equal(result[1].record.filename, 'expl2.xml');
            assert.equal(result[1].merge_reason, 'duplicate');
            assert.equal(result[2].entry.severity, 'updatedSev');
            assert.equal(result[2].record.filename, 'expl3.xml');
            assert.equal(result[2].merge_reason, 'update');
            assert.equal(result[3].entry.severity, 'severity2');
            assert.equal(result[3].record.filename, 'expl1.xml');
            assert.equal(result[3].merge_reason, 'new');
            done();
        });
    });

    it('mergeCount (1)', function (done) {
        bbr.mergeCount('allergies', 'testPatient1', {}, function (err, count) {
            assert.ifError(err);
            assert.equal(count, 4);
            done();
        });
    });

    it('mergeCount (2)', function (done) {
        bbr.mergeCount('allergies', 'testPatient1', {
            merge_reason: 'duplicate'
        }, function (err, count) {
            assert.ifError(err);
            assert.equal(count, 1);
            done();
        });
    });

    var paid1;
    var paid2;

    it('saveMatches', function (done) {
        var inputSection = [{
            partial_entry: {
                name: 'allergy1',
                severity: 'severity3',
                value: {
                    code: 'code1',
                    display: 'display1'
                }
            },
            partial_matches: [{
                match_entry: aid1,
                match_object: {
                    percent: 80,
                    subelements: ['severity']
                }
            }]
        }, {
            partial_entry: {
                name: 'allergy2',
                severity: 'severity2',
                value: {
                    code: 'code5',
                    display: 'display2'
                }
            },
            partial_matches: [{
                match_entry: aid2,
                match_object: {
                    percent: 90,
                    subelements: ['value.code']
                }
            }]
        }];
        bbr.saveMatches('allergies', 'testPatient1', inputSection, fileId4, function (err, ids) {
            assert.ifError(err);
            paid1 = ids[0];
            paid2 = ids[1];
            done();
        });
    });

    it('getMatches', function (done) {
        bbr.getMatches('allergies', 'testPatient1', 'name severity value.code', function (err, entries) {
            assert.ifError(err);
            var i = [entries[0].entry.name, entries[1].entry.name].indexOf('allergy1');

            assert.equal(entries[i].matches[0].match_entry.severity, 'updatedSev');
            assert.equal(entries[i].entry.severity, 'severity3');
            assert.equal(entries[i].matches[0].match_object.percent, 80);
            assert.deepEqual(entries[i].matches[0].match_object.subelements, ['severity']);
            assert.equal(entries[(i + 1) % 2].matches[0].match_entry.value.code, 'code2');
            assert.equal(entries[(i + 1) % 2].entry.value.code, 'code5');
            assert.equal(entries[(i + 1) % 2].matches[0].match_object.percent, 90);
            assert.deepEqual(entries[(i + 1) % 2].matches[0].match_object.subelements, ['value.code']);
            done();
        });
    });

    it('getMatch', function (done) {
        bbr.getMatch('allergies', 'testPatient1', paid1, function (err, matchInfo) {
            assert.ifError(err);
            assert.equal(matchInfo.matches[0].match_entry.severity, 'updatedSev');
            assert.equal(matchInfo.entry.severity, 'severity3');
            assert.equal(matchInfo.matches[0].match_object.percent, 80);
            assert.deepEqual(matchInfo.matches[0].match_object.subelements, ['severity']);
            done();
        });
    });

    it('matchCount (1)', function (done) {
        bbr.matchCount('allergies', 'testPatient1', {}, function (err, count) {
            assert.ifError(err);
            assert.equal(count, 2);
            done();
        });
    });

    it('matchCount (2)', function (done) {
        bbr.matchCount('allergies', 'testPatient1', {
            percent: 80
        }, function (err, count) {
            assert.ifError(err);
            assert.equal(count, 1);
            done();
        });
    });

    it('acceptMatch', function (done) {
        bbr.acceptMatch('allergies', 'testPatient1', paid1, 'added', function (err) {
            assert.ifError(err);
            bbr.getSection('allergies', 'testPatient1', function (err, entries) {
                assert.ifError(err);
                assert.equal(entries.length, 3); // added to Master Health Record
                bbr.matchCount('allergies', 'testPatient1', {}, function (err, count) {
                    assert.ifError(err);
                    assert.equal(count, 1); // removed from Partial Health Record 
                    done();
                });
            });
        });
    });

    it('cancelMatch', function (done) {
        bbr.cancelMatch('allergies', 'testPatient1', paid2, 'ignored', function (err) {
            assert.ifError(err);
            bbr.getSection('allergies', 'testPatient1', function (err, entries) {
                assert.ifError(err);
                assert.equal(entries.length, 3); // not added to Master Health Record
                bbr.matchCount('allergies', 'testPatient1', {}, function (err, count) {
                    assert.ifError(err);
                    assert.equal(count, 0); // removed from Partial Health Record 
                    done();
                });
            });
        });
    });

    it('clearDatabase', function (done) {
        bbr.clearDatabase(function (err) {
            assert.ifError(err);
            done();
        });
    });

    it('disconnect', function (done) {
        bbr.disconnect(function (err) {
            assert.ifError(err);
            done();
        });
    });
});
