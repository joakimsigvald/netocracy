"use strict";

if (typeof require !== 'undefined') {
    var Parallel = require('paralleljs');
}

var createRelationComputer = function (universeComputer, iterations) {
    function computeRelations(universe, callback) {
        const n = universe.length;
        const n1 = n;
        const n2 = n;
        var firstGen = universeComputer.getTrust(universe);
        let relations = firstGen.map((row) => [...row]);
        let friendships = universe.map((d, x) => {
            return {
                x,
                n,
                friends: d.peers.filter(p => p.trust > 0).map(f => { return { index: f.index, weight: f.trust / 2 }; })
            };
        });
        computeNextGeneration(firstGen, 1, relations,
            () => {
                truncateLower(relations)
                callback(relations);
            });

        function truncateLower(relations) {
            for (var x = 0; x < n2; x++)
                for (var y = 0; y < n2; y++)
                    relations[x][y] = Math.max(0, relations[x][y]);
        }

        function computeNextGeneration(currentGen, i, relations, callback) {
            const inputs = friendships.map(fs => Object.assign({ currentGen }, fs));
            const p = new Parallel(inputs);

            function computeNextIndividualRelations(inp) {
                const weightedTrusts = inp.friends.map(f => inp.currentGen[f.index].map(v => v * f.weight));
                const indexes = [...Array(inp.n).keys()];
                return indexes.map(y => y === inp.x ? 0 : weightedTrusts.reduce((sum, wt) => sum + wt[y], 0))
            };

            function handleNextGeneration(nextGen) {
                addMatrix(relations, nextGen);
                if (i < iterations) {
                    computeNextGeneration(nextGen, i + 1, relations, callback);
                }
                else {
                    callback();
                }
            };

            p.map(computeNextIndividualRelations).then(handleNextGeneration);
        }

        function addMatrix(first, second) {
            for (var x = 0; x < n1; x++) {
                for (var y = 0; y < n1; y++) {
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
