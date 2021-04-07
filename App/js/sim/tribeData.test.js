"use strict";

let createUtil = require('../fun/util');
let util = createUtil();
let createNaming = require('../fun/naming');
let naming = createNaming();
let createTrustCalibrator = require('./trustCalibrator');
let trustCalibrator = createTrustCalibrator();
let createUniverseData = require('./universeData');
let createRelationComputer = require('./relationComputer');
let createConnectionData = require('./connectionData');
let createTribeData = require('./tribeData');

if (typeof test !== 'undefined') {
    test('ring-of-trust with 11 individuals form one tribe', () => {
        testRingOfTrust(11, 1, 0);
    });

    test('ring-of-trust with 15 individuals form one tribes', () => {
        testRingOfTrust(15, 1, 0);
    });

    test('ring-of-trust with 16 individuals form one tribes', () => {
        testRingOfTrust(16, 1, 0);
    });

    test('ring-of-trust with 17 individuals form one tribes', () => {
        testRingOfTrust(17, 1, 0);
    });

    test('ring-of-trust with 22 individuals form two tribes', () => {
        testRingOfTrust(22, 2, 0);
    });
}

function testRingOfTrust(n, tribeCount, outsiders) {
    let individuals = [];
    for (var i = 0; i < n; i++) {
        individuals.push([{ index: (n + i - 1) % n, trust: 1 }, { index: (i + 1) % n, trust: 1 }]);
    }
    let tribeData = getTarget(individuals);

    let tribes = tribeData.getTribes();
    expect(tribes.length).toBe(tribeCount);
    let actualOutsiders = tribeData.getOutsiders();
    expect(actualOutsiders.length).toBe(outsiders);
}

function getTarget(individuals) {
    let universeData = createUniverseData(util, trustCalibrator, []);
    individuals.forEach(ind => universeData.addIndividual(universeData.createIndividual(ind)));
    let relationComputer = createRelationComputer(universeData, 10);
    let connectionData = createConnectionData(util, relationComputer);
    return createTribeData(util, naming, universeData, connectionData);
}

function getTestSuite() {
    return {
        testRingOfTrust: testRingOfTrust
    }
}

if (typeof module !== 'undefined') {
    module.exports = getTestSuite
}
