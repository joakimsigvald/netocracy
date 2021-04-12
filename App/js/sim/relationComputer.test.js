"use strict";

let createUtil = require('../fun/util');
let util = createUtil();
let createTrustCalibrator = require('./trustCalibrator');
let trustCalibrator = createTrustCalibrator();
let createUniverseComputer = require('./universeComputer');
let createRelationComputer = require('./relationComputer');

if (typeof test !== 'undefined') {

    test('given empty universe, relations are empty', () => {
        computeRelations([], relations => {
            expect(relations.length).toBe(0);
        });
    });

    test('given two individuals with mutual trust = 1, get one relation in each direction with strength 1', () => {
        const universe = createUniverse([[{ i: 1, t: 1 }], [{ i: 0, t: 1 }]])

        computeRelations(universe, relations => {
            expectStrengths(relations, [[0, 1], [1, 0]]);
        });
    });

    test('given two individuals with different trust, get one relation in each direction with strength 1', () => {
        const universe = createUniverse([[{ i: 1, t: .3 }], [{ i: 0, t: 1.9 }]])

        computeRelations(universe, relations => {
            expectStrengths(relations, [[0, 1], [1, 0]]);
        });
    });

    test('given two individuals with negative trust, relation strength is zero', () => {
        const universe = createUniverse([[{ i: 1, t: -.3 }], [{ i: 0, t: -1.9 }]])

        computeRelations(universe, relations => {
            expectStrengths(relations, [[0, 0], [0, 0]]);
        });
    });

    test('given three individuals with mutual trust 0.5, relation strengths are 2/3', () => {
        const universe = createUniverse([
            [{ i: 1, t: 0.5 }, { i: 2, t: 0.5 }],
            [{ i: 0, t: 0.5 }, { i: 2, t: 0.5 }],
            [{ i: 0, t: 0.5 }, { i: 1, t: 0.5 }]
        ])

        computeRelations(universe, relations => {
            const expectedStrength = 2.0 / 3;

            expectStrengths(relations, [
                [0, expectedStrength, expectedStrength],
                [expectedStrength, 0, expectedStrength],
                [expectedStrength, expectedStrength, 0]]);
        });
    });

    test('given four individuals with mutual trust 1, relation strengths are 1/2',
        testFourIndividuals);

    test('given one negative trust but positive relations to same peer are stronger, relation is positive',
        testMixedTrustWherePositiveIsStronger);

    test('given one negative trust that exactly balance positive relations to same peer, relation is zero',
        testMixedTrustWherePositiveEqualsNegative);
}

function testFourIndividuals() {
    const universe = createUniverse([
        [{ i: 1, t: 1 }, { i: 2, t: 1 }, { i: 3, t: 1 }],
        [{ i: 0, t: 1 }, { i: 2, t: 1 }, { i: 3, t: 1 }],
        [{ i: 0, t: 1 }, { i: 1, t: 1 }, { i: 3, t: 1 }],
        [{ i: 0, t: 1 }, { i: 1, t: 1 }, { i: 2, t: 1 }]
    ])

    computeRelations(universe, relations => {
        const expectedStrength = 1.0 / 2;

        expectStrengths(relations,
            [
                [0, expectedStrength, expectedStrength, expectedStrength],
                [expectedStrength, 0, expectedStrength, expectedStrength],
                [expectedStrength, expectedStrength, 0, expectedStrength],
                [expectedStrength, expectedStrength, expectedStrength, 0],
            ]);
    });
};

function testMixedTrustWherePositiveIsStronger() {
    const universe = createUniverse([
        [{ i: 1, t: -.1 }, { i: 2, t: .9 }],
        [{ i: 0, t: .5 }, { i: 2, t: .5 }],
        [{ i: 0, t: .5 }, { i: 1, t: .5 }],
    ])

    computeRelations(universe, relations => {
        expect(relations[0][1]).toBeGreaterThan(0);
    });
};

function testMixedTrustWherePositiveEqualsNegative() {
    const universe = createUniverse([
        [{ i: 1, t: -.2 }, { i: 2, t: .8 }],
        [{ i: 0, t: .5 }, { i: 2, t: .5 }],
        [{ i: 0, t: .5 }, { i: 1, t: .5 }],
    ])

    computeRelations(universe, relations => {
        expect(relations[0][1]).toBe(0);
    });
};

function computeRelations(universe, callback) {
    let relationComputer = createTarget();
    return relationComputer.computeRelations(universe, callback);
}

function createTarget() {
    let universeComputer = createUniverseComputer(util, trustCalibrator);
    return createRelationComputer(universeComputer, 10);
}

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
            expect(relations[x][y]).toBeCloseTo(expectedStrengths[x][y], 4);
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
