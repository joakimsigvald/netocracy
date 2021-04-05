var simulation = null;

function startSimulation() {

    const util = createUtil();
    const naming = createNaming();
    const universeData = createUniverseData(util, 3);
    const trustCalibrator = createTrustCalibrator();
    const relationComputer = createRelationComputer(util, trustCalibrator);
    const connectionData = createConnectionData(util, universeData, relationComputer);
    const tribeData = createTribeData(util, naming, universeData, connectionData);
    simulationData = createSimulationData(universeData, connectionData, tribeData);


    simulation = createSimulation(naming, simulationData, true);
    $('#startSimulationBtn').hide();
    $('#addIndividualBtn').show();
    simulation.start();
    $(document).keydown(function (e) {
        switch (e.which) {
            case 13:
                addIndividual();
                break;
            case 46:
                simulation.deleteSelectedIndividual();
                break;
            default:
                // No operation
        }
    });
}

function addIndividual() {
    simulation.addIndividual();
}
