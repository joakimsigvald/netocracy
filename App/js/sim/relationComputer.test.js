"use strict";

let createUtil = require('../fun/util');
let util = createUtil();
let createTrustCalibrator = require('./trustCalibrator');
let trustCalibrator = createTrustCalibrator();
let createRelationComputer = require('./relationComputer');
let relationComputer = createRelationComputer(util, trustCalibrator);

if (typeof test !== 'undefined') {

    test('given empty universe, relations are empty', () => {
        const universe = [];
        const relations = relationComputer.computeRelations(universe);
        expect(relations.length).toBe(0);
    });

    test('given two individuals with mutual trust = 1, get one relation in each direction with strength 1', () => {
        const universe = createUniverse([[{ i: 1, t: 1 }], [{ i: 0, t: 1 }]])

        const relations = relationComputer.computeRelations(universe);

        expectStrengths(relations, [[0, 1], [1, 0]]);
    });

    test('given two individuals with different trust, get one relation in each direction with strength 1', () => {
        const universe = createUniverse([[{ i: 1, t: .3 }], [{ i: 0, t: 1.9 }]])

        const relations = relationComputer.computeRelations(universe);

        expectStrengths(relations, [[0, 1], [1, 0]]);
    });

    test('given two individuals with negative trust, relation strength is zero', () => {
        const universe = createUniverse([[{ i: 1, t: -.3 }], [{ i: 0, t: -1.9 }]])

        const relations = relationComputer.computeRelations(universe);

        expectStrengths(relations, [[0, 0], [0, 0]]);
    });

    test('given three individuals with mutual trust 0.5, relation strengths are 0.625', () => {
        const universe = createUniverse([
            [{ i: 1, t: 0.5 }, { i: 2, t: 0.5 }],
            [{ i: 0, t: 0.5 }, { i: 2, t: 0.5 }],
            [{ i: 0, t: 0.5 }, { i: 1, t: 0.5 }]
        ])

        const relations = relationComputer.computeRelations(universe);
        const expectedStrength = .5 + .5 * .5 * .5;

        expectStrengths(relations, [
            [0, expectedStrength, expectedStrength],
            [expectedStrength, 0, expectedStrength],
            [expectedStrength, expectedStrength, 0]]);
    });

    test('given four individuals with mutual trust 1, relation strengths are damped additive strengts from peers',
        testFourIndividuals);

    test('given one negative trust but positive relations to same peer are stronger, relation is positive',
        testMixedTrustWherePositiveIsStronger);
}

function testFourIndividuals() {
    const universe = createUniverse([
        [{ i: 1, t: 1 }, { i: 2, t: 1 }, { i: 3, t: 1 }],
        [{ i: 0, t: 1 }, { i: 2, t: 1 }, { i: 3, t: 1 }],
        [{ i: 0, t: 1 }, { i: 1, t: 1 }, { i: 3, t: 1 }],
        [{ i: 0, t: 1 }, { i: 1, t: 1 }, { i: 2, t: 1 }]
    ])

    const relations = relationComputer.computeRelations(universe);

    const calibratedTrust = 1 / 3.0;
    const expectedStrength = calibratedTrust + 0.5 * 2 * calibratedTrust * (calibratedTrust + 0.5 * calibratedTrust * calibratedTrust)

    expectStrengths(relations,
        [
            [0, expectedStrength, expectedStrength, expectedStrength],
            [expectedStrength, 0, expectedStrength, expectedStrength],
            [expectedStrength, expectedStrength, 0, expectedStrength],
            [expectedStrength, expectedStrength, expectedStrength, 0],
        ]);
};

function testMixedTrustWherePositiveIsStronger() {
    const universe = createUniverse([
        [{ i: 1, t: -.1 }, { i: 2, t: 1 }, { i: 3, t: 1 }],
        [{ i: 0, t: 1 }, { i: 2, t: 1 }, { i: 3, t: 1 }],
        [{ i: 0, t: 1 }, { i: 1, t: 1 }, { i: 3, t: 1 }],
        [{ i: 0, t: 1 }, { i: 1, t: 1 }, { i: 2, t: 1 }]
    ])

    const relations = relationComputer.computeRelations(universe);

    const calibratedTrust = 1 / 2.1;
    const expectedStrength =
        0.5 * 2 * calibratedTrust * (calibratedTrust
            + 0.5 * calibratedTrust * calibratedTrust)
        - .1 * calibratedTrust;

    expect(expectedStrength).toBeGreaterThan(0);
    expect(relations[0][1]).toBeCloseTo(expectedStrength, 5);
};

function createUniverse(allTrusts) {
    return [...Array(allTrusts.length).keys()].map(i => createIndividual(i, allTrusts[i]));
}

function createIndividual(index, trusts) {
    return { index: index, peers: createPeers(trusts) };
}

function createPeers(trusts) {
    return trusts.map(createPeer);
}

function createPeer(it) {
    return { index: it.i, trust: it.t };
}

function expectStrengths(relations, expectedStrengths) {
    expect(relations.length).toBe(expectedStrengths.length);
    for (var x = 0; x < expectedStrengths.length; x++)
        for (var y = 0; y < expectedStrengths.length; y++)
            expect(relations[x][y]).toBeCloseTo(expectedStrengths[x][y], 5);
}

function getTestSuite() {
    return {
        testFourIndividuals: testFourIndividuals,
        testMixedTrustWherePositiveIsStronger: testMixedTrustWherePositiveIsStronger
    }
}

if (typeof module !== 'undefined') {
    module.exports = getTestSuite
}
