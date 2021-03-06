"use strict";

var createColoring = function (dark) {
    var primes = [1, 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37].reverse();
    var steps = {};

    function getColorByIndex(index, n, strength) {
        var step = steps[n] || (steps[n] = calculateStep(getMaxLimit(n), n));
        return getColorByPos((index * step) % n, n, strength)
    }

    // Ex. n: step
    // 1: 1
    // 2: 1
    // 3: 2
    // 4: 3
    // 5: 3
    // 6: 1
    // 7: 3
    // 8: 3
    // 9: 2
    // 10: 3
    // 11: 5
    // 12: 5
    // 13: 5
    var getMaxLimit = n => Math.ceil(Math.sqrt(n)) + 2;

    function calculateStep(limit, n) {
        var step = primes.find(p => p < limit) ?? 1;
        return step > 1 && n % step === 0
            ? calculateStep(step, n)
            : step;
    }

    function getColorByPos(pos, n, strength) {
        var strengthFactor = strength * strength;
        var inverseStrengthFactor = 1 - strengthFactor;

        var getRedDark = i => inverseStrengthFactor * 0.5 + strengthFactor * (1 - getcolorComponent(i));
        var getRedLight = i => inverseStrengthFactor * 0.85 + strengthFactor * getcolorComponent(i);
        var getGreenDark = i => inverseStrengthFactor * 0.5 + 0.9 * strengthFactor * (1 - getcolorComponent((i + 1) % 3));
        var getGreenLight = i => inverseStrengthFactor * 0.85 + 0.9 * strengthFactor * getcolorComponent((i + 1) % 3);
        var getBlueDark = i => inverseStrengthFactor * 0.4 + 0.1 + 0.9 * strengthFactor * (1 - getcolorComponent((i + 2) % 3));
        var getBlueLight = i => inverseStrengthFactor * 0.75 + 0.1 + 0.9 * strengthFactor * getcolorComponent((i + 2) % 3);

        var i = n ? 3.0 * pos / n : 0;
        var r = (dark ? getRedDark : getRedLight)(i);
        var g = (dark ? getGreenDark : getGreenLight)(i);
        var b = (dark ? getBlueDark : getBlueLight)(i);
        return getColor(r, g, b);
    }

    var getcolorComponent = pos => Math.min(1, pos, 3 - pos);

    var getColor = (r, g, b) => `rgb(${Math.round(255 * r)},${Math.round(255 * g)},${Math.round(255 * b)})`;

    return {
        getColorByIndex: getColorByIndex
    };
};