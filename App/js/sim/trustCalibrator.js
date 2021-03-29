"use strict";

function calibrate(universe) {
    return universe.map(calibrateIndividual);

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
        peers = calibratePeersSum(peers, mapTrust(peers).reduce((a, b) => a + b, 0));
        peers = calibratePeersMin(peers, Math.min(...mapTrust(peers)));
        return calibratePeersMax(peers, Math.max(...mapTrust(peers)));
    }

    function mapTrust(peers) {
        return peers.map(p => p.trust);
    }

    function calibratePeersSum(peers, sumTrust) {
        if (sumTrust === 1)
            return peers;
        const dif = (1.0 - sumTrust) / peers.length;
        return peers.map(p => Object.assign({}, p, { trust: p.trust + dif }));
    }

    function calibratePeersMin(peers, minTrust) {
        return minTrust < -1
            ? calibratePeersBounds(peers, mid => (mid + 1) / (mid - minTrust))
            : peers;
    }

    function calibratePeersMax(peers, maxTrust) {
        return maxTrust > 1
            ? calibratePeersBounds(peers, mid => (1 - mid) / (maxTrust - mid))
            : peers;
    }

    function calibratePeersBounds(peers, computeScaleFactor) {
        const mid = 1.0 / peers.length;
        const scaleFactor = computeScaleFactor(mid);
        return peers.map(p => Object.assign({}, p, { trust: scale(p.trust) }));

        function scale(trust) {
            return mid + (trust - mid) * scaleFactor
        }
    }
}