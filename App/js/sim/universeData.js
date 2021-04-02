"use strict";

var createUniverseData = function (averageFriends) {
    var universe = null;

    function init() {
        universe = [
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
    }

    function addIndividual() {
        const node = createIndividual();
        universe.push(node);
        node.peers.forEach(p => universe[p.index].peers.push({ index: node.index, trust: Math.random() }))
    }

    function createIndividual() {
        return {
            index: universe.length,
            name: { first: 'Auto', last: `Generated ${universe.length + 1}` },
            peers: generatePeers()
        };
    }

    function generatePeers() {
        const randomIndividuals = universe.map(i => { return { o: Math.random(), i: i.index }; });
        randomIndividuals.sort((a, b) => a.o - b.o);
        return randomIndividuals.slice(0, averageFriends).map(t => { return { index: t.i, trust: Math.random() }; });
    }

    return {
        init: init,
        getUniverse: () => universe,
        addIndividual: addIndividual
    };
}

if (typeof module !== 'undefined') {
    module.exports = createUniverseData;
}
