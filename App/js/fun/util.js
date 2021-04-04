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

    function stocasticShift(n, number) {
        const nBits = Math.ceil(Math.log2(n));
        const bound = Math.pow(2, nBits);
        const shifted = (bound - n - 1 + number) << 1;
        return shifted < bound ? shifted : (shifted + 1) % bound;
    }

    return {
        removeFrom: removeFrom,
        create2DArray: create2DArray,
        max: max,
        stocasticShift: stocasticShift
    }
}

if (typeof module !== 'undefined') {
    module.exports = createUtil
}
