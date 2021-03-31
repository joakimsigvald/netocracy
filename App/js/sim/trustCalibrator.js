"use strict";

function calibrate(universe) {
    return universe.map(calibrateIndividual);
}

function calibrateIndividual(ind) {
    return {
        index: ind.index,
        name: ind.name,
        peers: calibratePeers(ind.peers)
    }
}

function calibratePeers(peers) {
    if (!peers.length)
        return peers;
    const friends = peers.filter(p => p.trust > 0);
    const foes = peers.filter(p => p.trust < 0);
    const strangers = peers.filter(p => p.trust === 0);
    var calibratedPeers = calibrateNonStrangers(friends, 1.0)
        .concat(calibrateNonStrangers(foes, -1.0))
        .concat(strangers)
    calibratedPeers.sort((a, b) => a.index - b.index);
    return calibratedPeers;
}

function calibrateNonStrangers(peers, expectedSum) {
    if (!peers.length)
        return peers;
    return calibratePeersSum(peers, sum(mapTrust(peers)), expectedSum);
}

function sum(arr) {
    return arr.reduce((a, b) => a + b, 0.0);
}

function mapTrust(peers) {
    return peers.map(p => p.trust);
}

function calibratePeersSum(peers, sumTrust, expectedSum) {
    if (sumTrust === expectedSum)
        return peers;
    return peers.map(p => Object.assign({}, p, { trust: p.trust * expectedSum / sumTrust }));
}

if (typeof module !== 'undefined') {
    module.exports = calibrate;
}
