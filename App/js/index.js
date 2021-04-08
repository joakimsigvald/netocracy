var simulation = null;

function startSimulation() {

    const util = createUtil();
    const naming = createNaming();
    const trustCalibrator = createTrustCalibrator();
    const universeData = createUniverseData(util, trustCalibrator, [], 3, 0);
    const relationComputer = createRelationComputer(universeData, 10);
    const connectionData = createConnectionData(util, relationComputer);
    const tribeData = createTribeData(util, naming, universeData, connectionData);
    const simulationData = createSimulationData(universeData, connectionData, tribeData);


    simulation = createSimulation(naming, simulationData, true);
    $('#startSimulationBtn').hide();
    $('#addIndividualBtn').show();
    simulation.start();
    $(document).keydown(function (e) {
        if (e.which > 48 && e.which < 58) {
            addIndividuals(e.which - 48);
            return;
        }
        switch (e.which) {
            case 13:
                addIndividuals(1);
                break;
            case 46:
                simulation.deleteSelectedIndividual();
                break;
            case 48:
                addIndividuals(10);
                break;
            default:
                // No operation
        }
    });
}

function addIndividuals(n) {
    simulation.addIndividuals(n);
}
