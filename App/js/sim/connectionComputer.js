"use strict";

var computeConnections = function (universe) {
    function computeConnectionGrid(relations) {
        const n = universe.length;
        var connections = create2DArray(n);
        for (var x = 1; x < n; x++)
            for (var y = 0; y < x; y++)
                connections[x][y] = relations[x][y] * relations[y][x]
        return connections;
    }

    function orderByDecreasingStrength(connections) {
        const res = [];
        const n = connections.length;
        for (var x = 1; x < n; x++)
            for (var y = 0; y < x; y++) {
                var strength = connections[x][y];
                if (strength) {
                    res.push({ x, y, strength });
                }
            }
        res.sort((a, b) => b.strength - a.strength);
        return res;
    }

    const grid = computeConnectionGrid(
        computeRelations(
            calibrate(universe)));

    return {
        grid: grid,
        ordered: orderByDecreasingStrength(grid)
    };
}