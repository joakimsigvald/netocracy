"use strict";

var createRelationComputer = function (util, trustCalibrator) {
    function computeRelations(universe) {
        const threshold = 0.00002;
        const calibratedUniverse = trustCalibrator.calibrate(universe);
        const n = calibratedUniverse.length;
        var relations = util.create2DArray(n);
        calibratedUniverse.forEach(source => updatePeerRelations(1.0, source, [source.index]));
        truncateLower(relations, n, 0);
        return relations;

        function updatePeerRelations(factor, source, ancestorIndices) {
            if (factor < threshold)
                return;
            const firstIndex = ancestorIndices[0];
            source.peers
                .filter(peer => !ancestorIndices.includes(peer.index))
                .forEach(addPeerRelations);

            function addPeerRelations(peer) {
                var addition = factor * peer.trust;
                relations[firstIndex][peer.index] = relations[firstIndex][peer.index] + addition;
                updatePeerRelations(0.5 * addition, calibratedUniverse[peer.index], ancestorIndices.concat([peer.index]));
            }
        }

        function truncateLower(relations, n, min) {
            for (var x = 0; x < n; x++)
                for (var y = 0; y < n; y++)
                    relations[x][y] = Math.max(min, relations[x][y]);
        }
    }

    function computeRelations2(universe) {
        const threshold = 0.00002;
        const calibratedUniverse = trustCalibrator.calibrate(universe);
        const n = calibratedUniverse.length;
        var relations = calibratedUniverse.map(source => computeSourceRelations(1.0, source, [source.index]) || createZeroArray(n));
        truncateLower(relations, n, 0);
        return relations;

        function computeSourceRelations(factor, source, ancestorIndices) {
            if (factor < threshold)
                return null;
            const additions = source.peers
                .filter(peer => !ancestorIndices.includes(peer.index))
                .map(computePeerRelations);
            if (!additions.length)
                return null;
            if (additions.length === 1)
                return additions[0];
            const retVal = additions.shift();
            additions.forEach(addition => {
                for (var i = 0; i < n; i++) {
                    retVal[i] = retVal[i] + addition[i];
                }
            });
            return retVal;

            function computePeerRelations(peer) {
                const addition = factor * peer.trust;
                const sourceRelations = computeSourceRelations(
                    0.5 * addition, calibratedUniverse[peer.index], ancestorIndices.concat([peer.index]))
                    || createZeroArray(n);
                sourceRelations[peer.index] = sourceRelations[peer.index] + addition;
                return sourceRelations;
            }
        }

        function createZeroArray(n) {
            return new Array(n).fill(0);
        }

        function truncateLower(relations, n, min) {
            for (var x = 0; x < n; x++)
                for (var y = 0; y < n; y++)
                    relations[x][y] = Math.max(min, relations[x][y]);
        }
    }

    return {
        computeRelations: computeRelations
    }
}

if (typeof module !== 'undefined') {
    module.exports = createRelationComputer
}
