"use strict";

function removeFrom(arr, el) {
    var index = arr.indexOf(el);
    arr.splice(index, 1);
}

function create2DArray(n) {
    return Array.from(Array(n), () => Array.from(Array(n), () => 0));
}

if (typeof module !== 'undefined') {
    module.exports = {
        removeFrom,
        create2DArray
    }
}
