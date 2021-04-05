"use strict";

let createUtil = require('../fun/util');
let util = createUtil();
let createTrustCalibrator = require('./trustCalibrator');
let trustCalibrator = createTrustCalibrator();
let createUniverseData = require('./universeData');

if (typeof test !== 'undefined') {
    test('when create universe, universe has five individuals',
        initialUniverseHasFiveIndividuals);

    test('when create universe and addIndividual, universe has five individuals with randomly selected friends',
        addedIndividualHasRandomFriends);
}

function initialUniverseHasFiveIndividuals() {
    const universeData = createUniverseData(util, trustCalibrator);
    const universe = universeData.getUniverse();
    expect(universe.length).toBe(5);
};

function addedIndividualHasRandomFriends() {
    const universeData = createUniverseData(util, trustCalibrator, null, 3, 1);

    universeData.addIndividual();

    const universe = universeData.getUniverse();
    expect(universe.length).toBe(6);
    const newIndividual = universe[5];
    const newPeers = newIndividual.peers;
    expect(newPeers[2].index).not.toBe(2);
};

function getTestSuite() {
    return {
        initialUniverseHasFiveIndividuals: initialUniverseHasFiveIndividuals,
        addedIndividualHasRandomFriends: addedIndividualHasRandomFriends
    }
}

if (typeof module !== 'undefined') {
    module.exports = getTestSuite
}
