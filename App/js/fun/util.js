"use strict";

const removeFrom = (arr, el) => {
    var index = arr.indexOf(el);
    arr.splice(index, 1);
}

const create2DArray = n => Array.from(Array(n), () => Array.from(Array(n), () => 0));
