"use strict";

var createConnectionComputer = function (util, relationComputer) {
    function computeGrid(universe, callback) {
        relationComputer.computeRelations(universe, relations => {
            const grid = aggregateRelations(relations);
            callback(grid);
        });
    }

    function aggregateRelations(relations) {
        const n = relations.length;
        var connections = util.create2DArray(n);
        traverse(n, (x, y) => {
            connections[x][y] = Math.sqrt(relations[x][y] * relations[y][x]);
        });
        return connections;
    }

    function orderByDecreasingStrength(connections) {
        const res = [];
        const n = connections.length;
        traverse(n, (x, y) => {
            var strength = connections[x][y];
            if (strength) {
                res.push({ x, y, strength });
            }
        });
        res.sort((a, b) => b.strength - a.strength);
        return res;
    }

    function traverse(n, action) {
        if (n < 2) return;
        for (var x = 1; x < n; x++)
            for (var y = 0; y < x; y++)
                action(x, y);
    }

    return {
        computeConnectionGrid: computeGrid,
        getOrderedConnections: orderByDecreasingStrength
    };
}

if (typeof module !== 'undefined') {
    module.exports = createConnectionComputer;
}
