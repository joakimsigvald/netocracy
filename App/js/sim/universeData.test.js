"use strict";

let createUtil = require('../fun/util');
let util = createUtil();
let createUniverseData = require('./universeData');

if (typeof test !== 'undefined') {
    test('when create universe, universe has five individuals',
        initialUniverseHasFiveIndividuals);

    test('when create universe and addIndividual, universe has five individuals with randomly selected friends',
        addedIndividualHasRandomFriends);
}

function initialUniverseHasFiveIndividuals() {
    const universeData = createUniverseData(util);
    const universe = universeData.getUniverse();
    expect(universe.length).toBe(5);
};

function addedIndividualHasRandomFriends() {
    const universeData = createUniverseData(util, 3);

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
