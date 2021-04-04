let createUtil = require('./util');
let util = createUtil();

if (typeof test !== 'undefined') {

    test('removing 2 from 1,2,3 leaves 1,3', () => {
        const arr = [1, 2, 3]
        util.removeFrom(arr, 2);
        expect(arr).toStrictEqual([1, 3]);
    });

    test('creating a 2D-array of size 3 creates a 3x3 array initialized with 0s', () => {
        const arr = util.create2DArray(3)
        expect(arr.length).toBe(3);
        expect(arr[0].length).toBe(3);
        expect(arr[1].length).toBe(3);
        expect(arr[2].length).toBe(3);
        expect(arr[0][0]).toBe(0);
        expect(arr[1][2]).toBe(0);
        expect(arr[2][1]).toBe(0);
    });

    test('stocasticShift is a bijection that displaces ints semi-randomly',
        testStocasticShift);
}

function testStocasticShift() {
    const arr = [0, 1, 2, 3, 4];
    const n = arr.length;
    const stocasticArr = arr.map(i => util.stocasticShift(n, i));
    expect(stocasticArr[0]).toBe(4);
    expect(stocasticArr[1]).toBe(6);
    expect(stocasticArr[2]).toBe(1);
    expect(stocasticArr[3]).toBe(3);
    expect(stocasticArr[4]).toBe(5);
};

function getTestSuite() {
    return {
        testStocasticShift: testStocasticShift
    }
}

if (typeof module !== 'undefined') {
    module.exports = getTestSuite
}

