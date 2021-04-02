"use strict";

//Specification: https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
var createSimulation = function (dark) {
    var graph = null;
    var simulationData = null;

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
        const universe = simulationData.getUniverse();
        const tribeNames = joinStrings(simulationData.getTribes().map(t => t.name));
        const memberNames = joinStrings(universe.slice(0, 10).map(t => firstAndLast(t.name))) + (universe.length > 10 ? '...' : '');
        const tribeless = universe.filter(i => !i.tribe);
        const tribelessNames = tribeless.length ? joinStrings(tribeless.map(t => firstAndLast(t.name))) : 'None';
        const waswere = tribeless.length === 1 ? 'was' : 'were';
        return `Generated tribes ${tribeNames} from ${memberNames}. ${tribelessNames} ${waswere} left without a tribe.`;
    }

    function start() {
        const universeData = createUniverseData(3);
        universeData.init();
        const relationComputer = createRelationComputer();
        const trustCalibrator = createTrustCalibrator();
        const connectionData = createConnectionData(universeData, relationComputer, trustCalibrator);
        connectionData.init();
        const tribeData = createTribeData(universeData, connectionData);
        tribeData.init();
        simulationData = createSimulationData(universeData, connectionData, tribeData);
        showStatus(simulationData);
        graph = createGraph(simulationData, dark);
        graph.draw();
    }

    function showStatus(simulationData) {
        const summary = generateSummary(simulationData);
        $('#statusPane').html(summary);
    }

    function addIndividual() {
        simulationData.addIndividual();
        graph.update(simulationData);
        showStatus(simulationData);
    }

    return {
        start: start,
        addIndividual: addIndividual
    };
}