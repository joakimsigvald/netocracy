let util = require('./util');

test('removing 2 from 1,2,3 leaves 1,3', () => {
    const arr = [1,2,3]
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