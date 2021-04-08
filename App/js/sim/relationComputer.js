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

        //TODO: parallelize using https://parallel.js.org/
        function computeNextGeneration(friendships, currentGen) {
            return friendships.map((friends, x) => computeNextIndividualRelations(currentGen, friends, x));
        }

        function computeNextIndividualRelations(currentGen, friends, x) {
            const weightedTrusts = friends.map(f => scale(currentGen[f.index], f.weight));
            return [...Array(n).keys()].map(y => y === x ? 0 : weightedTrusts.reduce((sum, wt) => sum + wt[y], 0))
        }

        function addMatrix(first, second) {
            for (var x = 0; x < n; x++) {
                for (var y = 0; y < n; y++) {
                    first[x][y] = first[x][y] + second[x][y];
                }
            }
        }
    }

    function scale(arr, weight) {
        return arr.map(v => v * weight);
    }

    return {
        computeRelations: computeRelations
    }
}

if (typeof module !== 'undefined') {
    module.exports = createRelationComputer
}
