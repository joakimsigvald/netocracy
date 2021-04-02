"use strict";

var createConnectionData = function (util, universeData, relationComputer, trustCalibrator) {
    var grid = null;

    function computeGrid() {
        const universe = universeData.getUniverse();
        const calibratedUniverse = trustCalibrator.calibrate(universe);
        const relations = relationComputer.computeRelations(calibratedUniverse);
        grid = computeConnectionGrid(universe, relations);
    }

    function computeConnectionGrid(universe, relations) {
        const n = universe.length;
        var connections = util.create2DArray(n);
        if (n > 1) {
            for (var x = 1; x < n; x++)
                for (var y = 0; y < x; y++)
                    connections[x][y] = relations[x][y] * relations[y][x]
        }
        return connections;
    }

    function orderByDecreasingStrength(connections) {
        const res = [];
        const n = connections.length;
        if (n > 1) {
            for (var x = 1; x < n; x++)
                for (var y = 0; y < x; y++) {
                    var strength = connections[x][y];
                    if (strength) {
                        res.push({ x, y, strength });
                    }
                }
        }
        res.sort((a, b) => b.strength - a.strength);
        return res;
    }

    computeGrid();
    return {
        update: computeGrid,
        getGrid: () => grid,
        getOrdered: () => orderByDecreasingStrength(grid)
    };
}

if (typeof module !== 'undefined') {
    module.exports = createConnectionData;
}
