"use strict";

function truncateLower(arr2D, n, min) {
    for (var i = 0; i < n; i++)
        for (var k = 0; k < n; k++)
            arr2D[i][k] = Math.max(min, arr2D[i][k]);
}

const removeFrom = (arr, el) => {
    var index = arr.indexOf(el);
    arr.splice(index, 1);
}

const create2DArray = n => Array.from(Array(n), () => Array.from(Array(n), () => 0));
