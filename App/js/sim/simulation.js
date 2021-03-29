"use strict";

//Specification: https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
var createSimulation = function () {
    var simulationData, graph;

    function start() {
        simulationData = createSimulationData();
        graph = createGraph(simulationData);
        visualize();
    }

    function visualize() {
        const joinStrings = strArr => {
            if (strArr.length == 0)
                return '';
            if (strArr.length == 1)
                return strArr[0];
            const last = strArr.pop();
            return `${strArr.join(', ')} and ${last}`;
        }

        const tribeless = simulationData.universe.filter(i => !i.tribe);
        const summary =
            `
Generated tribes ${joinStrings(simulationData.tribes.map(t => t.name))} from ${joinStrings(simulationData.universe.map(t => firstAndLast(t.name)))}.
${tribeless.length ? joinStrings(tribeless.map(t => firstAndLast(t.name))) : 'None'} ${tribeless.length === 1 ? 'was' : 'were'} left without a tribe.
`;
        $('#controlPane').html(summary);
        graph.draw();
    }

    return {
        start: start
    };
}