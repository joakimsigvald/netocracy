"use strict";

var createRelationComputer = function (universeData) {
    function computeRelations() {
        const iterations = 10;
        const universe = universeData.getCalibratedUniverse();
        const n = universe.length;
        var relations = mergeGenerations(createTrustGenerations());
        truncateLower(relations)
        return relations;

        function truncateLower(relations) {
            for (var x = 0; x < n; x++)
                for (var y = 0; y < n; y++)
                    relations[x][y] = Math.max(0, relations[x][y]);
        }

        function createTrustGenerations() {
            const generations = new Array(n);
            generations[0] = universeData.getTrust();
            for (var gen = 1; gen < iterations; gen++) {
                generations[gen] = computeNextGeneration(generations[gen - 1]);
            }
            return generations;
        }

        function computeNextGeneration(currentGen) {
            var nextGen = universe.map(d => {
                const row = new Array(n);
                const friends = d.peers.filter(p => p.trust > 0)
                    .map(f => { return { weight: f.trust / 2, trusts: currentGen[f.index] }; });
                for (var y = 0; y < n; y++) {
                    row[y] = y === d.index ? 0 : friends.reduce((sum, f) => sum + f.weight * f.trusts[y], 0); // apply threshold?;
                }
                return row;
            });
            return nextGen;
        }

        function mergeGenerations(generations) {
            const retVal = generations.shift();
            generations.forEach(gen => {
                for (var x = 0; x < n; x++) {
                    for (var y = 0; y < n; y++) {
                        retVal[x][y] = retVal[x][y] + gen[x][y];
                    }
                }
            });
            return retVal;
        }
    }

    return {
        computeRelations: computeRelations
    }
}

if (typeof module !== 'undefined') {
    module.exports = createRelationComputer
}
