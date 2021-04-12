"use strict";

let createUtil = require('../fun/util');
let util = createUtil();
let createNaming = require('../fun/naming');
let naming = createNaming();
let createTrustCalibrator = require('./trustCalibrator');
let trustCalibrator = createTrustCalibrator();
let createUniverseComputer = require('./universeComputer');
let createRelationComputer = require('./relationComputer');
let createConnectionComputer = require('./connectionComputer');
let createTribeComputer = require('./tribeComputer');

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
    const individuals = [];
    for (let i = 0; i < n; i++) {
        individuals.push([{ index: (n + i - 1) % n, trust: 1 }, { index: (i + 1) % n, trust: 1 }]);
    }
    computeTribes(individuals, (tribes, actualOutsiders) => {
        expect(tribes.length).toBe(tribeCount);
        expect(actualOutsiders.length).toBe(outsiders);
    });
}

function computeTribes(individuals, callback) {
    const universeComputer = createUniverseComputer(util, trustCalibrator);
    const universe = createUniverse(universeComputer, individuals);
    const connectionComputer = getConnectionComputer(universeComputer);
    const tribeComputer = createTribeComputer(util, naming, connectionComputer);
    connectionComputer.computeConnectionGrid(universe, connections => {
        tribeComputer.computeTribes(universe, connections, tribes => {
            const outsiders = tribeComputer.getOutsiders(universe);
            callback(tribes, outsiders);
        });
    });
}

function createUniverse(universeComputer, individuals) {
    return universeComputer.addIndividuals([], individuals);
}

function getConnectionComputer(universeComputer) {
    const relationComputer = createRelationComputer(universeComputer, 10);
    return createConnectionComputer(util, relationComputer);
}

function getTestSuite() {
    return {
        testRingOfTrust: testRingOfTrust
    }
}

if (typeof module !== 'undefined') {
    module.exports = getTestSuite
}
