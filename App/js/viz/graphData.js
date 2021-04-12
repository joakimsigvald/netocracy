"use strict";

var createGraphData = function (chartWidth, chartHeight, dark) {
    const coloring = createColoring(dark);
    let nodes = [];
    let links = [];

    function init(universe, tribes, trust) {
        nodes = createNodes(universe, tribes.length, chartWidth, chartHeight);
        links = createLinks(universe, trust);
    }

    function createLinks(universe, trust) {
        const n = trust.length;
        const links = [];
        for (var x = 1; x < n; x++)
            for (var y = 0; y < x; y++) {
                const xy = trust[x][y];
                const yx = trust[y][x];
                if (yx || xy) {
                    links.push(createLink({ x, y, strength: {xy, yx} }));
                }
            }
        return links;

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
                label: `${ind.id}`
            };
        }

        function getColor(ind) {
            return coloring.getColorByIndex(ind.tribe ? ind.tribe.index : tribeCount, tribeCount + 1, 1);
        }
    }

    function update(universe, trust, tribes, chartWidth, chartHeight) {
        const newNodes = createNodes(universe, tribes.length, chartWidth, chartHeight);
        const newLinks = createLinks(universe, trust);
        const newNodeIds = newNodes.map(n => n.id);
        const newLinkIds = newLinks.map(l => l.id);
        const oldNodeIds = nodes.map(n => n.id);
        const oldLinkIds = links.map(l => l.id);

        const nodesToAdd = newNodes.filter(n => oldNodeIds.indexOf(n.id) === -1);
        const nodesToRemove = nodes.filter(n => newNodeIds.indexOf(n.id) === -1).map(l => oldNodeIds.indexOf(l.id));
        const nodesToUpdate = newNodes
            .filter(nn => oldNodeIds.indexOf(nn.id) > -1)
            .map(nn => {
                var oldNode = nodes[oldNodeIds.indexOf(nn.id)];
                oldNode.r = nn.r;
                oldNode.bounds = nn.bounds;
                oldNode.color = nn.color;
                oldNode.label = nn.label;
                return nn.id;
            });

        const linksToAdd = newLinks.filter(l => oldLinkIds.indexOf(l.id) === -1);
        const linksToRemove = links.filter(l => newLinkIds.indexOf(l.id) === -1).map(l => oldLinkIds.indexOf(l.id));
        const linksToUpdate = newLinks.filter(l => {
            let index = oldLinkIds.indexOf(l.id);
            return index !== -1 && !linksEqual(l, links[index]);
        }).map(l => {
            let oldLink = links[oldLinkIds.indexOf(l.id)];
            oldLink.strength = l.strength;
            oldLink.width = l.width;
            return oldLink;
        });
        nodesToRemove.reverse().forEach(i => nodes.splice(i, 1));
        linksToRemove.reverse().forEach(i => links.splice(i, 1));
        nodesToAdd.forEach(n => nodes.push(n));
        linksToAdd.forEach(l => links.push(l));

        function linksEqual(l1, l2) {
            return l1.strength.xy === l2.strength.xy && l1.strength.yx === l2.strength.yx;
        }

        return {
            addedOrRemoved: nodesToAdd.length + nodesToRemove.length + linksToAdd.length + linksToRemove.length > 0,
            nodesToUpdate: nodesToUpdate,
            linksToUpdate: linksToUpdate
        };
    }

    return {
        init: init,
        getNodes: () => nodes,
        getLinks: () => links,
        update: update
    };
}