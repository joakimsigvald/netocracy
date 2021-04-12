"use strict";

//Specification: https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
var createSimulation = function (naming, universeComputer, connectionComputer, tribeComputer, dark) {
    const graph = createGraph(naming, dark);
    let universe = [];

    function joinStrings(strArr) {
        switch (strArr.length) {
            case 0: return '';
            case 1: return strArr[0];
            default:
                const last = strArr.pop();
                return `${strArr.join(', ')} and ${last}`;
        }
    }

    function generateSummary(tribes) {
        const tribeNames = joinStrings(tribes.map(t => t.name));
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
        showStatus([]);
        graph.draw(universe, [], []);
    }

    function showStatus(tribes) {
        const summary = generateSummary(tribes);
        $('#statusPane').html(summary);
    }

    function addIndividuals(n) {
        universe = universeComputer.generateIndividuals(universe, n);
        simulate(universe);
    }

    function deleteSelectedIndividual() {
        var selected = graph.getSelectedIndividual();
        if (selected) {
            universe = universeComputer.removeIndividual(universe, selected.id);
            simulate(universe);
        }
    }

    function simulate(universe) {
        connectionComputer.computeConnectionGrid(universe, connections => {
            tribeComputer.computeTribes(universe, connections, update);
        });
    }

    function update(tribes) {
        const trust = universeComputer.getTrust(universe);
        graph.update(universe, trust, tribes);
        showStatus(tribes);
    }

    return {
        start: start,
        addIndividuals: addIndividuals,
        deleteSelectedIndividual: deleteSelectedIndividual
    };
}