"use strict";

let createUtil = require('../fun/util');
let util = createUtil();
let createNaming = require('../fun/naming');
let naming = createNaming();
let createTrustCalibrator = require('./trustCalibrator');
let trustCalibrator = createTrustCalibrator();
let createRelationComputer = require('./relationComputer');
let relationComputer = createRelationComputer(util, trustCalibrator);
let createUniverseData = require('./universeData');
let createConnectionData = require('./connectionData');
let createTribeData = require('./tribeData');

if (typeof test !== 'undefined') {
    test('ring-of-trust with 11 individuals form one tribe', () => {
        testRingOfTrust(11, 1, 0);
    });

    test('ring-of-trust with 15 individuals form two tribes', () => {
        testRingOfTrust(15, 1, 0);
    });

    test('ring-of-trust with 16 individuals form two tribes', () => {
        testRingOfTrust(16, 2, 0);
    });

    test('ring-of-trust with 17 individuals form three tribes', () => {
        testRingOfTrust(17, 3, 0);
    });
}

function testRingOfTrust(n, tribeCount, outsiders) {
    let universeData = createUniverseData(util, 0, []);
    for (var i = 0; i < n; i++) {
        universeData.addIndividual(universeData.createIndividual(
            [{ index: (n + i - 1) % n, trust: 1 }, { index: (i + 1) % n, trust: 1 }]));
    }
    let connectionData = createConnectionData(util, universeData, relationComputer);
    let tribeData = createTribeData(util, naming, universeData, connectionData);

    let tribes = tribeData.getTribes();
    //let grid = connectionData.getGrid();
    //for (var x = 1; x < n; x++)
    //    for (var y = 0; y < x; y++)
    //        expect(grid[x][y]).toBeGreaterThan(0);
    expect(tribes.length).toBe(tribeCount);
    let universe = universeData.getUniverse();
    expect(universe.filter(i => !i.tribe).length).toBe(outsiders);
}

function getTestSuite() {
    return {
        testRingOfTrust: testRingOfTrust
    }
}

if (typeof module !== 'undefined') {
    module.exports = getTestSuite
}
