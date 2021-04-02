"use strict";

function createUtil() {
    function removeFrom(arr, el) {
        var index = arr.indexOf(el);
        arr.splice(index, 1);
    }

    function create2DArray(n) {
        return Array.from(Array(n), () => Array.from(Array(n), () => 0));
    }

    function max(arr, getVal) {
        return Math.max(...arr.map(getVal));
    }

    return {
        removeFrom: removeFrom,
        create2DArray: create2DArray,
        max: max
    }
}

if (typeof module !== 'undefined') {
    module.exports = createUtil
}
