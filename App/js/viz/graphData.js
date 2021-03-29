"use strict";

var createGraphData = function (simulationData, chartWidth, chartHeight) {
    const coloring = createColoring();
    var panelSize = Math.min(chartWidth, chartHeight);
    var nodeMargin = panelSize * Math.sqrt(1 / simulationData.universe.length) * 0.22;
    var nodeRadius = panelSize * 0.05;

    function createNode(ind) {
        return {
            id: ind.index,
            r: nodeRadius,
            bounds: nodeRadius + nodeMargin,
            color: coloring.getColorByIndex(ind.tribe ? ind.tribe.index : simulationData.tribes.length, simulationData.tribes.length + 1, 1),
            label: firstAndLast(ind.name)
        };
    }

    function createLink(con) {
        return {
            id: con.x + "-" + con.y,
            source: con.x,
            target: con.y,
            strength: con.strength
        }
    };

    return {
        nodes: simulationData.universe.map(createNode),
        links: simulationData.connections.map(createLink)
    };
}