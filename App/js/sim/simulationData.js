"use strict";

//Specification: https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
var createSimulationData = function (universeData, connectionData, tribeData) {

    function addIndividuals(n) {
        for (var i = 0; i < n; i++) {
            universeData.addIndividual();
        }
        update()    }

    function removeIndividual(id) {
        universeData.removeIndividual(id);
        update();
    }

    function update() {
        connectionData.update();
        tribeData.update();
    }

    return {
        getUniverse: universeData.getUniverse,
        getTrust: universeData.getTrust,
        getConnections: connectionData.getOrdered,
        getTribes: tribeData.getTribes,
        addIndividuals: addIndividuals,
        removeIndividual: removeIndividual
    };
}

if (typeof module !== 'undefined') {
    module.exports = createSimulationData;
}
