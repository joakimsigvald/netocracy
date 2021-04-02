"use strict";

var createRelationComputer = function () {
    return {
        computeRelations: computeRelations
    }

    function computeRelations(universe) {
        const threshold = 0.001;
        const n = universe.length;
        var relations = create2DArray(n);
        universe.forEach(source => updatePeerRelations(1.0, source, [source.index]));
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
                updatePeerRelations(0.5 * addition, universe[peer.index], ancestorIndices.concat([peer.index]));
            }
        }

        function truncateLower(relations, n, min) {
            for (var x = 0; x < n; x++)
                for (var y = 0; y < n; y++)
                    relations[x][y] = Math.max(min, relations[x][y]);
        }
    }
}