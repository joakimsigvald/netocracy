"use strict";

//Specification: https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
var createSimulation = function () {

    function visualize(simulationData) {
        const summary = generateSummary(simulationData);
        $('#controlPane').html(summary);
        createGraph(simulationData).draw();
    }

    function joinStrings(strArr) {
        switch (strArr.length) {
            case 0: return '';
            case 1: return strArr[0];
            default:
                const last = strArr.pop();
                return `${strArr.join(', ')} and ${last}`;
        }
    }

    function generateSummary(simulationData) {
        const tribeNames = joinStrings(simulationData.tribes.map(t => t.name));
        const memberNames = joinStrings(simulationData.universe.map(t => firstAndLast(t.name)));
        const tribeless = simulationData.universe.filter(i => !i.tribe);
        const tribelessNames = tribeless.length ? joinStrings(tribeless.map(t => firstAndLast(t.name))) : 'None';
        const waswere = tribeless.length === 1 ? 'was' : 'were';
        return `Generated tribes ${tribeNames} from ${memberNames}. ${tribelessNames} ${waswere} left without a tribe.`;
    }

    return {
        start: () => visualize(createSimulationData())
    };
}