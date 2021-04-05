"use strict";

function createNaming() {
    const generateTribeName = (tribes, first, second) => {
        const name = `The ${first.name.last}-${second.name.last} tribe`;
        var tribename = name;
        var n = 1;
        while (tribes.find(t => t.name === tribename)) {
            tribename = `${name} ${roman(++n)}`;
        }
        return tribename;
    }

    const firstAndLast = name => `${name.first} ${name.last}`;

    const roman = num => num < 1000 ? smallroman(num) : 'M' + roman(num - 1000);

    const smallroman = num => {
        const expand = (a, b, c) => ['', a, a + a, a + a + a, a + b, b, b + a, b + a + a, b + a + a + a, a + c];
        var arrConv = [expand('I', 'V', 'X'), expand('X', 'L', 'C'), expand('C', 'D', 'M')];
        return num.toString().reverse().map((a, i) => arrConv[i][a - 48]).reverse().join("");
    }

    return {
        generateTribeName: generateTribeName,
        firstAndLast: firstAndLast,
    }
}

if (typeof module !== 'undefined') {
    module.exports = createNaming
}
