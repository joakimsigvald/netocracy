"use strict";

function createTrustCalibrator() {

    function calibrate(universe) {
        return universe.map(calibrateIndividual);
    }

    function calibrateIndividual(ind) {
        return {
            id: ind.id,
            index: ind.index,
            name: ind.name,
            peers: calibratePeers(ind.peers)
        }
    }

    function calibratePeers(peers) {
        if (!peers.length)
            return peers;
        const sumOfAbsoluteTrust = sum(mapAbsoluteTrust(peers));
        return sumOfAbsoluteTrust ? calibrateTrust(peers, sumOfAbsoluteTrust) : peers;
    }

    function calibrateTrust(peers, sumOfAbsoluteTrust) {
        return sumOfAbsoluteTrust === 1
            ? peers
            : peers.map(p => Object.assign({}, p, { trust: p.trust / sumOfAbsoluteTrust }));
    }

    function sum(arr) {
        return arr.reduce((a, b) => a + b, 0.0);
    }

    function mapAbsoluteTrust(peers) {
        return peers.map(p => Math.abs(p.trust));
    }

    return {
        calibrate: calibrate
    };
}

if (typeof module !== 'undefined') {
    module.exports = createTrustCalibrator;
}
