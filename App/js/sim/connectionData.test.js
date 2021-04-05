"use strict";

let createUtil = require('../fun/util');
let util = createUtil();
let createTrustCalibrator = require('./trustCalibrator');
let trustCalibrator = createTrustCalibrator();
let createRelationComputer = require('./relationComputer');
let relationComputer = createRelationComputer(util, trustCalibrator);
let createUniverseData = require('./universeData');
let createConnectionData = require('./connectionData');

test('given empty universe, connections are empty', () => {
    let universeData = getUniverseData();
    let connectionData = createConnectionData(util, universeData, relationComputer);
    let grid = connectionData.getGrid();
    let ordered = connectionData.getOrdered();
    expect(grid.length).toBe(0);
    expect(ordered.length).toBe(0);
});

test('given two individuals with mutualTrust, get one connection with strength 1', () => {
    let universeData = getUniverseData();

    universeData.addIndividual(universeData.createIndividual([{ index: 1, trust: 1 }]));
    universeData.addIndividual(universeData.createIndividual([{ index: 0, trust: 1 }]));
    let connectionData = createConnectionData(util, universeData, relationComputer);
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

test('given three individuals with mutualTrust, get one connection with strength 0.625', () => {
    let universeData = getUniverseData();

    universeData.addIndividual(universeData.createIndividual([{ index: 1, trust: 1 }, { index: 2, trust: 1 }]));
    universeData.addIndividual(universeData.createIndividual([{ index: 0, trust: 1 }, { index: 2, trust: 1 }]));
    universeData.addIndividual(universeData.createIndividual([{ index: 0, trust: 1 }, { index: 1, trust: 1 }]));
    let connectionData = createConnectionData(util, universeData, relationComputer);
    let grid = connectionData.getGrid();
    let ordered = connectionData.getOrdered();
    expect(grid.length).toBe(3);
    expect(ordered.length).toBe(3);
    const expectedStrength = .625;
    expect(grid[1][0]).toBe(expectedStrength);
    expect(grid[2][0]).toBe(expectedStrength);
    expect(grid[2][1]).toBe(expectedStrength);
});

test('given two-step two-way relation with maximum trust, connection strength is 1/4', () => {
    testNStepConnection(2, 1.0 / 4);
});

test('given three-step two-way relation with maximum trust, connection strength is 1/16', () => {
    testNStepConnection(3, 1.0 / 16);
});

test('given four-step two-way relation with maximum trust, connection strength is 1/64', () => {
    testNStepConnection(4, 1.0 / 64);
});

test('given five-step two-way relation with maximum trust, connection strength is 1/256', () => {
    testNStepConnection(5, 1.0 / 256);
});

test('given six-step two-way relation with maximum trust, connection strength is 1/1024', () => {
    testNStepConnection(6, 1.0 / 1024);
});

test('given seven-step two-way relation with maximum trust, connection strength is 1/4096', () => {
    testNStepConnection(7, 1.0 / 4096);
});

test('given eight-step two-way relation with maximum trust, connection strength is 1/16384', () => {
    testNStepConnection(8, 1.0 / 16384);
});

test('given nine-step two-way relation with maximum trust, connection strength is 0', () => {
    testNStepConnection(9, 0);
});

function testNStepConnection(n, expectedStrength) {
    let universeData = getUniverseData();

    universeData.addIndividual(universeData.createIndividual([{ index: 1, trust: 1 }]));
    for (var i = 0; i < n - 1; i++) {
        universeData.addIndividual(universeData.createIndividual([{ index: i, trust: 1 }, { index: i + 2, trust: 1 }]));
    }
    universeData.addIndividual(universeData.createIndividual([{ index: n - 1, trust: 1 }]));
    let connectionData = createConnectionData(util, universeData, relationComputer);
    let grid = connectionData.getGrid();
    expect(grid[n][0]).toBe(expectedStrength);
}

function getUniverseData() {
    return createUniverseData(util, trustCalibrator, []);
}
