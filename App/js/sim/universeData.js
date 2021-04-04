"use strict";

var createUniverseData = function (util, averageFriends) {
    var universe = null;

    function init() {
        universe = [
            {
                id: 0,
                index: 0,
                name: { first: 'Howard', last: 'Aiken' },
                peers: [{ index: 1, trust: -1 }, { index: 2, trust: 1 }, { index: 4, trust: 1 }]
            },
            {
                id: 1,
                index: 1,
                name: { first: 'Ada', last: 'Byron' },
                peers: [{ index: 0, trust: 1 }, { index: 3, trust: 1 }, { index: 4, trust: 1 }]
            },
            {
                id: 2,
                index: 2,
                name: { first: 'Noam', last: 'Chomsky' },
                peers: [{ index: 0, trust: 1 }, { index: 1, trust: -1 }, { index: 3, trust: 1 }]
            },
            {
                id: 3,
                index: 3,
                name: { first: 'Edsger', last: 'Dijkstra' },
                peers: [{ index: 0, trust: 1 }, { index: 1, trust: 1 }, { index: 2, trust: 1 }]
            },
            {
                id: 4,
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
            id: util.max(universe, i => i.id) + 1,
            index: universe.length,
            name: { first: 'Auto', last: `Generated ${universe.length + 1}` },
            peers: generatePeers()
        };
    }

    function generatePeers() {
        const n = universe.length;
        const stocasticIndividuals = universe.map(i =>
        {
            return { o: util.stocasticShift(n, i.index), i: i.index };
        });
        stocasticIndividuals.sort((a, b) => a.o - b.o);
        return stocasticIndividuals.slice(0, averageFriends).map(t => { return { index: t.i, trust: Math.random() }; });
    }

    function removeIndividual(removeId) {
        const removeIndex = universe.find(i => i.id === removeId).index;
        const lastIndex = universe.length - 1;
        if (removeIndex < lastIndex) {
            const lastIndividual = universe[lastIndex];
            universe[removeIndex] = lastIndividual;
            lastIndividual.index = removeIndex;
        }
        universe.splice(lastIndex, 1);
        universe.forEach(i => removeAndReindex(i.peers, removeIndex, lastIndex));
    }

    function removeAndReindex(peers, removeIndex, moveIndex) {
        var peerIndex = peers.findIndex(p => p.index === removeIndex);
        if (peerIndex > -1) {
            peers.splice(peerIndex, 1);
        }
        if (removeIndex === moveIndex)
            return;
        peerIndex = peers.findIndex(p => p.index === moveIndex);
        if (peerIndex > -1) {
            peers[peerIndex].index = removeIndex;
        }
    }

    init();
    return {
        getUniverse: () => universe,
        addIndividual: addIndividual,
        removeIndividual: removeIndividual
    };
}

if (typeof module !== 'undefined') {
    module.exports = createUniverseData;
}
