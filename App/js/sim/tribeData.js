"use strict";

function createTribeData(universeData, connectionData) {
    var tribes = null;
    var connections = null;

    function createTribes() {
        tribes = [];
        connections = connectionData.getGrid();
        const universe = universeData.getUniverse();
        connectionData.getOrdered().forEach(c => {
            var first = universe[c.x];
            var second = universe[c.y];
            if (!first.tribe) {
                if (!second.tribe) {
                    createTribe([first, second]);
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
    }

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
        initiateMember(tribe, aspiringMember, tribe.members.length);
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
        const dominantTribe = getDominantTribe(first.tribe, second.tribe);
        const secondaryTribe = dominantTribe === first.tribe ? second.tribe : first.tribe;
        var allMembers = dominantTribe.members.concat(secondaryTribe.members);
        if (!canFormOneTribe(allMembers))
            return;
        removeFrom(tribes, first.tribe);
        removeFrom(tribes, second.tribe);
        createTribe(allMembers);
    }

    function getDominantTribe(tribe1, tribe2) {
        if (tribe1.members.length > tribe2.members.length)
            return tribe1;
        if (tribe2.members.length > tribe1.members.length)
            return tribe2;
        return (getFoundingBond(tribe1) > getFoundingBond(tribe2))
            ? tribe1 : tribe2;
    }

    function getFoundingBond(tribe) {
        const ind1 = tribe.members[0];
        const ind2 = tribe.members[1];
        return connections[ind1.index][ind2.index] || connections[ind2.index][ind1.index];
    }

    function createTribe(members) {
        const tribe = {
            name: generateTribeName(tribes, members[0], members[1]),
            members: members
        };
        members.forEach((m, i) => initiateMember(tribe, m, i + 1));
        tribes.push(tribe);
    }

    function initiateMember(tribe, member, n) {
        member.tribe = tribe;
        member.membershipNumber = n;
    }

    return {
        init: createTribes,
        update: createTribes,
        getTribes: () => tribes
    };
}