"use strict";

var createRelationComputer = function (util, trustCalibrator) {
    function computeRelations(universe) {
        const threshold = 0.001;
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

    return {
        computeRelations: computeRelations
    }
}

if (typeof module !== 'undefined') {
    module.exports = createRelationComputer
}
