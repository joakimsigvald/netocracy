"use strict";

let createTrustCalibrator = require('./trustCalibrator');
let calibrate = universe => createTrustCalibrator().calibrate(universe);

test('given empty universe, return copy of universe', () => {
    const universe = [];
    expect(createTrustCalibrator().calibrate(universe)).toStrictEqual(universe);
});

test('given universe with one individual without trust, return deep copy of universe', () => {
    const universe = [{
        index: 0,
        name: { first: 'Howard', last: 'Aiken' },
        peers: []
    }];
    const res = calibrate(universe);
    expect(res).toStrictEqual(universe);
    expect(res[0]).not.toBe(universe[0]);
});

test('given universe with two individuals who trust each other, return deep copy of universe with trust = 1', () => {
    const universe = [
        {
            index: 0,
            name: { first: 'Howard', last: 'Aiken' },
            peers: [{ index: 1, trust: 0.5 }]
        },
        {
            index: 1,
            name: { first: 'Ada', last: 'Byron' },
            peers: [{ index: 0, trust: 3 }]
        },
    ];
    const res = calibrate(universe);
    expect(res.length).toBe(2);
    const howard = res[0];
    const ada = res[1];
    expect(howard.name.first).toBe('Howard');
    expect(howard.peers[0].index).toBe(1);
    expect(howard.peers[0].trust).toBe(1);
    expect(ada.name.first).toBe('Ada');
    expect(ada.peers[0].index).toBe(0);
    expect(ada.peers[0].trust).toBe(1);
});

test('given universe with two individuals who distrust each other, return deep copy of universe with trust = -1', () => {
    const universe = [
        {
            index: 0,
            name: { first: 'Howard', last: 'Aiken' },
            peers: [{ index: 1, trust: -0.5 }]
        },
        {
            index: 1,
            name: { first: 'Ada', last: 'Byron' },
            peers: [{ index: 0, trust: -3 }]
        },
    ];
    const res = calibrate(universe);
    expect(res.length).toBe(2);
    const howard = res[0];
    const ada = res[1];
    expect(howard.name.first).toBe('Howard');
    expect(howard.peers[0].index).toBe(1);
    expect(howard.peers[0].trust).toBe(-1);
    expect(ada.name.first).toBe('Ada');
    expect(ada.peers[0].index).toBe(0);
    expect(ada.peers[0].trust).toBe(-1);
});

test('given universe with two individuals who are indifferent to each other, return deep copy of universe', () => {
    const universe = [
        {
            index: 0,
            name: { first: 'Howard', last: 'Aiken' },
            peers: [{ index: 1, trust: 0 }]
        },
        {
            index: 1,
            name: { first: 'Ada', last: 'Byron' },
            peers: [{ index: 0, trust: 0 }]
        },
    ];
    const res = calibrate(universe);
    expect(res).toStrictEqual(universe);
});

test('given universe with three individuals who trust each other, each individuals sum of trust is 1', () => {
    const universe = [
        {
            index: 0,
            name: { first: 'Howard', last: 'Aiken' },
            peers: [{ index: 1, trust: 1 }, { index: 2, trust: 1 }]
        },
        {
            index: 1,
            name: { first: 'Ada', last: 'Byron' },
            peers: [{ index: 0, trust: 1 }, { index: 2, trust: 1 }]
        },
        {
            index: 2,
            name: { first: 'Noam', last: 'Chomsky' },
            peers: [{ index: 0, trust: 1 }, { index: 1, trust: 1 }]
        }
    ];
    const res = calibrate(universe);
    expect(res.length).toBe(3);
    const howard = res[0];
    const ada = res[1];
    const noam = res[2];
    expect(howard.name.first).toBe('Howard');
    expect(ada.name.first).toBe('Ada');
    expect(noam.name.first).toBe('Noam');
    expect(howard.peers[0].trust).toBe(.5);
    expect(howard.peers[1].trust).toBe(.5);
    expect(ada.peers[0].trust).toBe(.5);
    expect(ada.peers[1].trust).toBe(.5);
    expect(noam.peers[0].trust).toBe(.5);
    expect(noam.peers[1].trust).toBe(.5);
});

test('given individual who trust one and distrust one, sum of trust - distrust is 1', () => {
    const universe = [
        {
            index: 0,
            name: { first: 'Howard', last: 'Aiken' },
            peers: [{ index: 1, trust: 1 }, { index: 2, trust: -1 }]
        }
    ];
    const res = calibrate(universe);
    expect(res.length).toBe(1);
    const howard = res[0];
    expect(howard.peers[0].trust - howard.peers[1].trust).toBe(1);
});

test('given individual who trust some and distrust some, calibrated individual has sum of positive trust = 1 and sum of negative trust = -1', () => {
    const universe = [
        {
            index: 0,
            name: { first: 'Howard', last: 'Aiken' },
            peers: [{ index: 1, trust: .2 }, { index: 2, trust: -.4 }, { index: 3, trust: .6 }, { index: 4, trust: -.8 }]
        }
    ];
    const res = calibrate(universe);
    expect(res.length).toBe(1);
    const howard = res[0];
    expect(howard.peers[0].trust).toBeCloseTo(.1, 5);
    expect(howard.peers[1].trust).toBeCloseTo(-.2, 5);
    expect(howard.peers[2].trust).toBeCloseTo(.3, 5);
    expect(howard.peers[3].trust).toBeCloseTo(-.4, 5);
});
