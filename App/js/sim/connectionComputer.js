"use strict";

var computeConnections = function (universe) {
    function computeConnectionGrid(relations) {
        const n = universe.length;
        var connections = create2DArray(n);
        for (var i = 1; i < n; i++)
            for (var k = 0; k < i; k++)
                connections[i][k] = relations[i][k] * relations[k][i]
        return connections;
    }

    function orderByDecreasingStrength(connections) {
        const res = [];
        const n = connections.length;
        for (var i = 1; i < n; i++)
            for (var k = 0; k < i; k++) {
                var strength = connections[i][k];
                if (strength) {
                    res.push({ x: i, y: k, strength: strength });
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