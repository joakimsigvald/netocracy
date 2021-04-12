"use strict";

let createUtil = require('../fun/util');
let util = createUtil();
let createTrustCalibrator = require('./trustCalibrator');
let trustCalibrator = createTrustCalibrator();
let createUniverseComputer = require('./universeComputer');

if (typeof test !== 'undefined') {
    test('when create universe and addIndividual, universe has five individuals with randomly selected friends',
        addedIndividualHasRandomFriends);
}

function addedIndividualHasRandomFriends() {
    const universeComputer = createUniverseComputer(util, trustCalibrator, 3, 0);
    let universe = universeComputer.generateIndividuals([], 6);
    expect(universe.length).toBe(6);
    const newestIndividual = universe[5];
    const newestPeers = newestIndividual.peers;
    expect(newestPeers[2].index).toBeGreaterThan(2);
};

function getTestSuite() {
    return {
        addedIndividualHasRandomFriends: addedIndividualHasRandomFriends
    }
}

if (typeof module !== 'undefined') {
    module.exports = getTestSuite
}
