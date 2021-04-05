"use strict";

//Specification: https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
var createSimulation = function (naming, simulationData, dark) {
    var graph = null;

    function joinStrings(strArr) {
        switch (strArr.length) {
            case 0: return '';
            case 1: return strArr[0];
            default:
                const last = strArr.pop();
                return `${strArr.join(', ')} and ${last}`;
        }
    }

    function generateSummary() {
        const universe = simulationData.getUniverse();
        const tribeNames = joinStrings(simulationData.getTribes().map(t => t.name));
        const memberNames = joinStrings(universe.slice(0, 10)
            .map(t => naming.firstAndLast(t.name)))
            + (universe.length > 10 ? '...' : '');
        const tribeless = universe.filter(i => !i.tribe);
        const tribelessNames = tribeless.length
            ? joinStrings(tribeless.map(t => naming.firstAndLast(t.name)))
            : 'None';
        const waswere = tribeless.length === 1 ? 'was' : 'were';
        return `Generated tribes ${tribeNames} from ${memberNames}. ${tribelessNames} ${waswere} left without a tribe.`;
    }

    function start() {
        showStatus();
        graph = createGraph(naming, simulationData, dark);
        graph.draw();
    }

    function showStatus() {
        const summary = generateSummary();
        $('#statusPane').html(summary);
    }

    function addIndividual() {
        simulationData.addIndividual();
        update();
    }

    function deleteSelectedIndividual() {
        var selected = graph.getSelectedIndividual();
        if (selected) {
            simulationData.removeIndividual(selected.id);
            update();
        }
    }

    function update() {
        graph.update(simulationData);
        showStatus(simulationData);
    }

    return {
        start: start,
        addIndividual: addIndividual,
        deleteSelectedIndividual: deleteSelectedIndividual
    };
}