"use strict";

var createUniverseData = function (util, trustCalibrator, initialUniverse, newFriendCount, trustSpread) {
    var universe = null;

    function init() {
        universe = initialUniverse || [
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

    function addIndividual(individual) {
        universe.push(individual || autoGenerateIndividual());
    }

    function autoGenerateIndividual() {
        const individual = createIndividual();
        individual.peers.forEach(p => universe[p.index].peers.push(
            { index: individual.index, trust: generateTrust() }))
        return individual;
    }

    function createIndividual(peers) {
        const id = universe.length ? util.max(universe, i => i.id) + 1 : 1;
        return {
            id: id,
            index: universe.length,
            name: { first: 'Auto', last: `Generated ${id}` },
            peers: peers || generatePeers()
        };
    }

    function generatePeers() {
        const n = universe.length;
        const stocasticIndividuals = universe.map(i =>
        {
            return { o: util.stocasticShift(n, i.index), i: i.index };
        });
        stocasticIndividuals.sort((a, b) => a.o - b.o);
        return stocasticIndividuals.slice(0, newFriendCount)
            .map(t => { return { index: t.i, trust: generateTrust() }; });
    }

    function generateTrust() {
        return 1 - trustSpread * Math.random();
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

    function getTrust() {
        const trust = util.create2DArray(universe.length);
        trustCalibrator.calibrate(universe).forEach(ind => {
            ind.peers.forEach(p => {
                trust[ind.index][p.index] = p.trust
            });
        });
        return trust;
    }

    init();
    return {
        getUniverse: () => universe,
        getTrust: getTrust,
        addIndividual: addIndividual,
        removeIndividual: removeIndividual,
        createIndividual: createIndividual,
        getCalibratedUniverse: () => trustCalibrator.calibrate(universe)
    };
}

if (typeof module !== 'undefined') {
    module.exports = createUniverseData;
}
