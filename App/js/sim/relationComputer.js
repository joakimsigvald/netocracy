"use strict";

var createRelationComputer = function (universeData, iterations) {
    function computeRelations() {
        const universe = universeData.getCalibratedUniverse();
        const n = universe.length;
        var generation = universeData.getTrust();
        let relations = generation.map((row) => [...row]);
        let friendships = universe.map(d =>
            d.peers.filter(p => p.trust > 0).map(f => { return { index: f.index, weight: f.trust / 2 }; }));
        for (var gen = 1; gen < iterations; gen++) {
            generation = computeNextGeneration(friendships, generation);
            addMatrix(relations, generation)
        }
        truncateLower(relations)
        return relations;

        function truncateLower(relations) {
            for (var x = 0; x < n; x++)
                for (var y = 0; y < n; y++)
                    relations[x][y] = Math.max(0, relations[x][y]);
        }

        function computeNextGeneration(friendships, currentGen) {
            var nextGen = friendships.map((friends, index) => {
                const row = new Array(n);
                const weightedTrusts = friends.map(f => { return { weight: f.weight, trusts: currentGen[f.index] }; });
                for (var y = 0; y < n; y++) {
                    row[y] = y === index ? 0 : weightedTrusts.reduce((sum, f) => sum + f.weight * f.trusts[y], 0);
                }
                return row;
            });
            return nextGen;
        }

        function addMatrix(first, second) {
            for (var x = 0; x < n; x++) {
                for (var y = 0; y < n; y++) {
                    first[x][y] = first[x][y] + second[x][y];
                }
            }
        }
    }

    return {
        computeRelations: computeRelations
    }
}

if (typeof module !== 'undefined') {
    module.exports = createRelationComputer
}
