"use strict";

function createTribeComputer(util, naming, connectionComputer) {
    function computeTribes(universe, connections, callback) {
        const tribes = [];
        const orderedConnections = connectionComputer.getOrderedConnections(connections);
        universe.forEach(ind => setMembership(ind, null, null));
        orderedConnections.forEach(c => {
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
        tribes.sort((a, b) => getDominantTribe(a, b) === a ? -1 : +1);
        callback(tribes);

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
            setMembership(aspiringMember, tribe, tribe.members.length);
        }

        function tryMergeTribes(first, second) {
            const dominantTribe = getDominantTribe(first.tribe, second.tribe);
            const secondaryTribe = dominantTribe === first.tribe ? second.tribe : first.tribe;
            var allMembers = dominantTribe.members.concat(secondaryTribe.members);
            if (!canFormOneTribe(allMembers))
                return;
            util.removeFrom(tribes, first.tribe);
            util.removeFrom(tribes, second.tribe);
            createTribe(allMembers);
        }

        function canFormOneTribe(aspiringMembers) {
            var indices = aspiringMembers.map(m => m.index);
            indices.sort((a, b) => a - b);
            const n = indices.length;
            for (var x = 1; x < n; x++)
                for (var y = 0; y < x; y++) {
                    if (!connections[indices[x]][indices[y]])
                        return false;
                }
            return true;
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
                name: naming.generateTribeName(tribes, members[0], members[1]),
                members: members
            };
            members.forEach((m, i) => setMembership(m, tribe, i + 1));
            tribes.push(tribe);
        }
    }

    function setMembership(member, tribe, n) {
        member.tribe = tribe;
        member.membershipNumber = n;
    }

    function getOutsiders(universe) {
        return universe.filter(i => !i.tribe);
    }

    return {
        computeTribes: computeTribes,
        getOutsiders: getOutsiders
    };
}

if (typeof module !== 'undefined') {
    module.exports = createTribeComputer;
}
