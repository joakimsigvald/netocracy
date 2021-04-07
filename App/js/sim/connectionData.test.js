"use strict";

let createUtil = require('../fun/util');
let util = createUtil();
let createTrustCalibrator = require('./trustCalibrator');
let trustCalibrator = createTrustCalibrator();
let createUniverseData = require('./universeData');
let createRelationComputer = require('./relationComputer');
let createConnectionData = require('./connectionData');

if (typeof test !== 'undefined') {
    test('given empty universe, connections are empty', () => {
        let connectionData = getTarget([]);
        let grid = connectionData.getGrid();
        let ordered = connectionData.getOrdered();
        expect(grid.length).toBe(0);
        expect(ordered.length).toBe(0);
    });

    test('given two individuals with mutualTrust, get one connection with strength 1', () => {
        let individuals = [
            [{ index: 1, trust: 1 }],
            [{ index: 0, trust: 1 }],
        ];
        let connectionData = getTarget(individuals);
        let grid = connectionData.getGrid();
        let ordered = connectionData.getOrdered();
        expect(grid.length).toBe(2);
        expect(ordered.length).toBe(1);
        expect(ordered[0].x).toBe(1);
        expect(ordered[0].y).toBe(0);
        expect(ordered[0].strength).toBe(1);
        expect(grid[0][0]).toBe(0);
        expect(grid[0][1]).toBe(0);
        expect(grid[1][0]).toBe(1);
        expect(grid[1][1]).toBe(0);
    });

    test('given three individuals with mutualTrust, get one connection with strength 2/3', () => {
        let individuals = [
            [{ index: 1, trust: 1 }, { index: 2, trust: 1 }],
            [{ index: 0, trust: 1 }, { index: 2, trust: 1 }],
            [{ index: 0, trust: 1 }, { index: 1, trust: 1 }]
        ];
        let connectionData = getTarget(individuals);
        let grid = connectionData.getGrid();
        let ordered = connectionData.getOrdered();
        expect(grid.length).toBe(3);
        expect(ordered.length).toBe(3);
        const expectedStrength = 2 / 3;
        expect(grid[1][0]).toBeCloseTo(expectedStrength, 5);
        expect(grid[2][0]).toBeCloseTo(expectedStrength, 5);
        expect(grid[2][1]).toBeCloseTo(expectedStrength, 5);
    });

    test('given two-step two-way relation with maximum trust, connection strength is 2/7', () => {
        testNStepConnection(2, 1/4, 2 / 7);
    });

    test('given three-step two-way relation with maximum trust, connection strength is 1/16-1/8', () => {
        testNStepConnection(3, 1 / 16, 1 / 8);
    });

    test('given four-step two-way relation with maximum trust, connection strength is 1/64-1/32', () => {
        testNStepConnection(4, 1 / 64, 1 / 32);
    });

    test('given five-step two-way relation with maximum trust, connection strength is 1/256', () => {
        testNStepConnection(5, 1 / 256, 1 / 128);
    });

    test('given six-step two-way relation with maximum trust, connection strength is 1/1024', () => {
        testNStepConnection(6, 1 / 1024, 1 / 512);
    });

    test('given seven-step two-way relation with maximum trust, connection strength is 1/4096', () => {
        testNStepConnection(7, 1 / 4096, 1 / 2048);
    });

    test('given eight-step two-way relation with maximum trust, connection strength is 1/16384', () => {
        testNStepConnection(8, 1 / 16384, 1 / 8192);
    });

    test('given nine-step two-way relation with maximum trust, connection strength is 0', () => {
        testNStepConnection(9, 1 / 65536, 1 / 32768);
    });
}

function testNStepConnection(n, expected, expectedUpper) {
    let individuals = [];
    individuals.push([{ index: 1, trust: 1 }]);
    for (var i = 0; i < n - 1; i++) {
        individuals.push([{ index: i, trust: 1 }, { index: i + 2, trust: 1 }]);
    }
    individuals.push([{ index: n - 1, trust: 1 }]);
    let connectionData = getTarget(individuals);
    let grid = connectionData.getGrid();
    let actual = grid[n][0];
    expect(actual).toBeGreaterThanOrEqual(expected);
    expect(actual).toBeLessThan(expectedUpper);
}

function getTarget(individuals) {
    let universeData = createUniverseData(util, trustCalibrator, []);
    individuals.forEach(ind => universeData.addIndividual(universeData.createIndividual(ind)));
    let relationComputer = createRelationComputer(universeData);
    return createConnectionData(util, relationComputer);
}

function getTestSuite() {
    return {
        testNStepConnection: testNStepConnection
    }
}

if (typeof module !== 'undefined') {
    module.exports = getTestSuite
}
