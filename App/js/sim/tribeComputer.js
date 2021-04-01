"use strict";

function computeTribes(universe, connections, orderedConnections) {
    var tribes = [];

    function areConnected(first, second) {
        return first.index < second.index
            ? areConnected(second, first)
            : connections[first.index][second.index] > 0;
    }

    function canJoinTribe(aspiringMember, tribe) {
        return tribe.members.every(member => areConnected(aspiringMember, member));
    }

    function tryJoinTribe(aspiringMember, tribe) {
        if (!canJoinTribe(aspiringMember, tribe))
            return;
        tribe.members.push(aspiringMember);
        aspiringMember.tribe = tribe;
    }

    function canFormOneTribe(aspiringMembers) {
        var indices = aspiringMembers.map(m => m.index);
        indices.sort();
        for (var i = 1; i < indices.lengt; i++)
            for (var k = 0; k < i; k++)
                if (connections[indices[i]][indices[k]] === 0)
                    return false;
        return true;
    }

    function tryMergeTribes(first, second) {
        var allMembers = first.tribe.members.concat(second.tribe.members);
        if (!canFormOneTribe(allMembers))
            return;
        removeFrom(tribes, first.tribe);
        removeFrom(tribes, second.tribe);
        createTribe([first, second], allMembers);
    }

    function createTribe(founders, members) {
        const tribe = {
            name: generateTribeName(tribes, founders[0], founders[1]),
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
    tribes.forEach((t, i) => t.index = i);
    return tribes;
}
