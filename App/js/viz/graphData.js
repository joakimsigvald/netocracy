"use strict";

var createGraphData = function (naming, simulationData, chartWidth, chartHeight, dark) {
    const coloring = createColoring(dark);
    var nodes = createNodes(simulationData.getUniverse(), simulationData.getTribes().length, chartWidth, chartHeight);
    var links = createLinks(simulationData.getUniverse(), simulationData.getConnections());

    function createLinks(universe, connections) {
        return connections.map(createLink);

        function createLink(con) {
            const source = universe.find(i => i.index == con.x).id;
            const target = universe.find(i => i.index == con.y).id;
            return {
                id: `${source}-${target}`,
                source: source,
                target: target,
                strength: con.strength
            }
        };
    }

    function createNodes(universe, tribeCount, chartWidth, chartHeight) {
        var panelSize = Math.min(chartWidth, chartHeight);
        var nodeRadius = 0.2 * panelSize * Math.sqrt(1.0 / universe.length);
        var nodeMargin = 1.1 * nodeRadius;
        const nodes = universe.map(createNode);
        nodes.sort((a, b) => (a.id - b.id));
        return nodes;

        function createNode(ind) {
            return {
                id: ind.id,
                r: nodeRadius,
                bounds: nodeRadius + nodeMargin,
                color: getColor(ind),
                label: ind.membershipNumber
                    ? `${ind.membershipNumber}. ${naming.firstAndLast(ind.name)}`
                    : naming.firstAndLast(ind.name)
            };
        }

        function getColor(ind) {
            return coloring.getColorByIndex(ind.tribe ? ind.tribe.index : tribeCount, tribeCount + 1, 1);
        }
    }

    function update(simulationData, chartWidth, chartHeight) {
        var newNodes = createNodes(simulationData.getUniverse(), simulationData.getTribes().length, chartWidth, chartHeight);
        var newLinks = createLinks(simulationData.getUniverse(), simulationData.getConnections());
        var newNodeIds = newNodes.map(n => n.id);
        var newLinkIds = newLinks.map(l => l.id);
        var oldNodeIds = nodes.map(n => n.id);
        var oldLinkIds = links.map(l => l.id);

        var nodesToAdd = newNodes.filter(n => oldNodeIds.indexOf(n.id) === -1);
        var nodesToRemove = nodes.filter(n => newNodeIds.indexOf(n.id) === -1).map(l => oldNodeIds.indexOf(l.id));
        var nodesToUpdate = newNodes
            .filter(nn => oldNodeIds.indexOf(nn.id) > -1)
            .map(nn => {
                var oldNode = nodes[oldNodeIds.indexOf(nn.id)];
                oldNode.r = nn.r;
                oldNode.bounds = nn.bounds;
                oldNode.color = nn.color;
                oldNode.label = nn.label;
                return nn.id;
            });

        var linksToAdd = newLinks.filter(l => oldLinkIds.indexOf(l.id) === -1);
        var linksToRemove = links.filter(l => newLinkIds.indexOf(l.id) === -1).map(l => oldLinkIds.indexOf(l.id));
        var linksToUpdate = newLinks.filter(l => {
            var index = oldLinkIds.indexOf(l.id);
            return index !== -1 && !linksEqual(l, links[index]);
        }).map(l => {
            var oldLink = links[oldLinkIds.indexOf(l.id)];
            oldLink.strength = l.strength;
            return oldLink;
        });
        nodesToRemove.reverse().forEach(i => nodes.splice(i, 1));
        linksToRemove.reverse().forEach(i => links.splice(i, 1));
        nodesToAdd.forEach(n => nodes.push(n));
        linksToAdd.forEach(l => links.push(l));

        function linksEqual(l1, l2) {
            return l1.strength === l2.strength;
        }

        return {
            addedOrRemoved: nodesToAdd.length + nodesToRemove.length + linksToAdd.length + linksToRemove.length > 0,
            nodesToUpdate: nodesToUpdate,
            linksToUpdate: linksToUpdate
        };
    }

    return {
        getNodes: () => nodes,
        getLinks: () => links,
        update: update
    };
}