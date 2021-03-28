"use strict";

//Specification: https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
var createSimulationData = function () {
    const threshold = 0.001;
    const universe = [
        {
            index: 0,
            name: { first: 'Howard', last: 'Aiken' },
            peers: [{ index: 1, trust: 1 }, { index: 2, trust: 1 }, { index: 4, trust: 1 }]
        },
        {
            index: 1,
            name: { first: 'Ada', last: 'Byron' },
            peers: [{ index: 0, trust: 1 }, { index: 3, trust: 1 }, { index: 4, trust: 1 }]
        },
        {
            index: 2,
            name: { first: 'Noam', last: 'Chomsky' },
            peers: [{ index: 0, trust: 1 }, { index: 1, trust: 1 }, { index: 3, trust: 1 }]
        },
        {
            index: 3,
            name: { first: 'Edsger', last: 'Dijkstra' },
            peers: [{ index: 0, trust: 1 }, { index: 1, trust: 1 }, { index: 2, trust: 1 }]
        },
        {
            index: 4,
            name: { first: 'J. Presper', last: 'Eckert' },
            peers: [{ index: 0, trust: 1 }, { index: 1, trust: 1 }, { index: 3, trust: 1 }]
        },
    ];

    // Algorithms

    function computeConnections() {
        const n = universe.length;
        var relations = create2DArray(n);
        var connections = create2DArray(n);
        updateRelations(universe);
        for (var i = 0; i < n; i++)
            for (var k = 0; k < n; k++)
                relations[i][k] = Math.max(0, relations[i][k]);
        for (var i = 1; i < n; i++)
            for (var k = 0; k < i; k++)
                connections[i][k] = relations[i][k] * relations[k][i]
        return connections;

        function updateRelations(individuals) {
            individuals.forEach(source => updatePeerRelations(1.0, source, [source.index]));
        }

        function updatePeerRelations(factor, source, ancestorIndices) {
            if (factor < threshold)
                return;
            const firstIndex = ancestorIndices[0];
            source.peers
                .filter(peer => !ancestorIndices.includes(peer.index))
                .forEach(addPeerRelations);

            function addPeerRelations(peer) {
                var addition = factor * peer.trust;
                relations[firstIndex][peer.index] = relations[firstIndex][peer.index] + addition;
                updatePeerRelations(0.5 * addition, universe[peer.index], ancestorIndices.concat([peer.index]));
            }
        }
    }

    function computeTribes(connections) {
        var tribes = [];
        var orderedConnections = orderByDecreasingStrength(connections);

        const areConnected = (first, second) =>
            first.index < second.index
                ? areConnected(second, first)
                : connections[first.index][second.index] > 0;

        const canJoinTribe = (aspiringMember, tribe) =>
            tribe.members.every(member => areConnected(aspiringMember, member));

        const tryJoinTribe = (aspiringMember, tribe) => {
            if (!canJoinTribe(aspiringMember, tribe))
                return;
            tribe.members.push(aspiringMember);
            aspiringMember.tribe = tribe;
        }

        const tryMergeTribes = (first, second) => {
            var allMembers = first.members.concat(second.members);
            if (!canFormOneTribe(allMembers))
                return;
            removeFrom(tribes, first.tribe);
            removeFrom(tribes, second.tribe);
            createTribe([first, second], allMembers);
        }

        const canFormOneTribe = aspiringMembers => {
            var indices = aspiringMembers.map(m => m.index);
            indices.sort();
            for (var i = 1; i < indices.lengt; i++)
                for (var k = 0; k < i; k++)
                    if (connections[indices[i]][indices[k]] === 0)
                        return false;
            return true;
        }

        const generateTribeName = (first, second) => {
            const name = `The ${first.name.last}-${second.name.last} tribe`;
            var tribename = name;
            var n = 1;
            while (tribes.find(t => t.name === tribename)) {
                tribename = `${name} ${roman(++n)}`;
            }
            return tribename;
        }

        const createTribe = (founders, members) => {
            const tribe = {
                name: generateTribeName(founders[0], founders[1]),
                members: members
            };
            members.forEach(m => m.tribe = tribe);
            tribes.push(tribe);
        }

        orderedConnections.forEach(c => {
            var first = universe[c.x];
            var second = universe[c.y];
            if (!first.tribe) {
                if (!second.tribe) {
                    createTribe([first, second], [first, second]);
                }
                else {
                    tryJoinTribe(first, second.tribe);
                }
            }
            else {
                if (!second.tribe) {
                    tryJoinTribe(second, first.tribe);
                }
                else if (first.tribe !== second.tribe) {
                    tryMergeTribes(first, second);
                }
            }
        });
        return tribes;
    }

    // Helpers

    const removeFrom = (arr, el) => {
        var index = arr.indexOf(el);
        arr.splice(index, 1);
    }

    const roman = num => num < 1000 ? smallroman(num) : 'M' + roman(num - 1000);

    const smallroman = num => {
        const expand = (a, b, c) => ['', a, a + a, a + a + a, a + b, b, b + a, b + a + a, b + a + a + a, a + c];
        var arrConv = [expand('I', 'V', 'X'), expand('X', 'L', 'C'), expand('C', 'D', 'M')];
        return num.toString().reverse().map((a, i) => arrConv[i][a - 48]).reverse().join("");
    }

    const orderByDecreasingStrength = connections => {
        const res = [];
        const n = connections.length;
        for (var i = 1; i < n; i++)
            for (var k = 0; k < i; k++) {
                var strength = connections[i][k];
                if (strength) {
                    res.push({ x: i, y: k, strength: strength });
                }
            }
        res.sort((a, b) => b.strength - a.strength);
        return res;
    }

    const create2DArray = n => Array.from(Array(n), () => Array.from(Array(n), () => 0));

    return {
        computeConnections: computeConnections,
        computeTribes: computeTribes,
        getUniverse: () => universe
    };
}