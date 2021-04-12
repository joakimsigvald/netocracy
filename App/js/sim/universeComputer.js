"use strict";

var createUniverseComputer = function (util, trustCalibrator, newFriendCount, newFoeCount) {

    function generateIndividuals(universe, n) {
        for (var i = 0; i < n; i++) {
            universe.push(autoGenerateIndividual(universe));
        }
        return trustCalibrator.calibrate(universe);
    }

    function addIndividuals(universe, individuals) {
        individuals.forEach(peers => universe.push(createIndividual(universe, peers)));
        return trustCalibrator.calibrate(universe);
    }

    function autoGenerateIndividual(universe) {
        const individual = createIndividual(universe);
        individual.peers.forEach(p => universe[p.index].peers.push(
            { index: individual.index, trust: 1 }))
        return individual;
    }

    function createIndividual(universe, peers) {
        const id = universe.length ? util.max(universe, i => i.id) + 1 : 1;
        return {
            id: id,
            index: universe.length,
            name: { first: 'Auto', last: `Generated ${id}` },
            peers: peers || generatePeers(universe)
        };
    }

    function generatePeers(universe) {
        const n = universe.length;
        const stocasticIndividuals = universe.map(i => {
            return { o: util.stocasticShift(n, i.index), i: i.index };
        });
        stocasticIndividuals.sort((a, b) => a.o - b.o);
        const friends = stocasticIndividuals.slice(0, newFriendCount)
            .map(t => { return { index: t.i, trust: 1 }; });
        const peers = stocasticIndividuals.length > newFriendCount
            ? friends.concat(generateFoes(stocasticIndividuals))
            : friends;
        peers.sort((a, b) => a.index - b.index);
        return peers;
    }

    function generateFoes(stocasticIndividuals) {
        return stocasticIndividuals.slice(newFriendCount, newFriendCount + newFoeCount)
            .map(t => { return { index: t.i, trust: -1 }; });
    }

    function removeIndividual(universe, removeId) {
        const removeIndex = universe.find(i => i.id === removeId).index;
        const lastIndex = universe.length - 1;
        if (removeIndex < lastIndex) {
            const lastIndividual = universe[lastIndex];
            universe[removeIndex] = lastIndividual;
            lastIndividual.index = removeIndex;
        }
        universe.splice(lastIndex, 1);
        universe.forEach(i => removeAndReindex(i.peers, removeIndex, lastIndex));
        return trustCalibrator.calibrate(universe);
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

    function getTrust(universe) {
        const trust = util.create2DArray(universe.length);
        trustCalibrator.calibrate(universe).forEach(ind => {
            ind.peers.forEach(p => {
                trust[ind.index][p.index] = p.trust
            });
        });
        return trust;
    }

    return {
        getTrust: getTrust,
        generateIndividuals: generateIndividuals,
        addIndividuals: addIndividuals,
        removeIndividual: removeIndividual
    };
}

if (typeof module !== 'undefined') {
    module.exports = createUniverseComputer;
}
