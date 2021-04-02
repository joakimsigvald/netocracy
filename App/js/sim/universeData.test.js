"use strict";

let createUniverseData = require('./universeData');

test('when create universe, universe has five individuals', () => {
    const universeData = createUniverseData();
    universeData.init();
    const universe = universeData.getUniverse();
    expect(universe.length).toBe(5);
});

test('when create universe and addIndividual, universe has five individuals with randomly selected friends', () => {
    const universeData = createUniverseData(3);
    universeData.init();

    universeData.addIndividual();

    const universe = universeData.getUniverse();
    expect(universe.length).toBe(6);
    const newIndividual = universe[5];
    const newPeers = newIndividual.peers;
    expect(newPeers[2].index).not.toBe(2);
});

