"use strict";

//Specification: https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
var createSimulationData = function () {
    const universe = [
        {
            index: 0,
            name: { first: 'Howard', last: 'Aiken' },
            peers: [{ index: 1, trust: -1 }, { index: 2, trust: 1 }, { index: 4, trust: 1 }]
        },
        {
            index: 1,
            name: { first: 'Ada', last: 'Byron' },
            peers: [{ index: 0, trust: 1 }, { index: 3, trust: 1 }, { index: 4, trust: 1 }]
        },
        {
            index: 2,
            name: { first: 'Noam', last: 'Chomsky' },
            peers: [{ index: 0, trust: 1 }, { index: 1, trust: -1 }, { index: 3, trust: 1 }]
        },
        {
            index: 3,
            name: { first: 'Edsger', last: 'Dijkstra' },
            peers: [{ index: 0, trust: 1 }, { index: 1, trust: 1 }, { index: 2, trust: 1 }]
        },
        {
            index: 4,
            name: { first: 'J. Presper', last: 'Eckert' },
            peers: [{ index: 0, trust: 1 }, { index: 1, trust: 1 }, { index: 3, trust: 1 }]
        },
    ];

    const connections = computeConnections(universe);
    const tribes = computeTribes(universe, connections.grid, connections.ordered);

    return {
        universe: universe,
        connections: connections.ordered,
        tribes: tribes
    };
}