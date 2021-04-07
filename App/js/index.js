var simulation = null;

function startSimulation() {

    const util = createUtil();
    const naming = createNaming();
    const trustCalibrator = createTrustCalibrator();
    const universeData = createUniverseData(util, trustCalibrator, [], 19, 1);
    const relationComputer = createRelationComputer(universeData, 10);
    const connectionData = createConnectionData(util, relationComputer);
    const tribeData = createTribeData(util, naming, universeData, connectionData);
    const simulationData = createSimulationData(universeData, connectionData, tribeData);


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
