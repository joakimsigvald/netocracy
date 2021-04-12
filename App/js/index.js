let simulation = null;

function startSimulation() {

    const util = createUtil();
    const naming = createNaming();
    const trustCalibrator = createTrustCalibrator();
    const universeComputer = createUniverseComputer(util, trustCalibrator, 3, 0);
    const relationComputer = createRelationComputer(universeComputer, 10);
    const connectionComputer = createConnectionComputer(util, relationComputer);
    const tribeComputer = createTribeComputer(util, naming, connectionComputer);

    simulation = createSimulation(naming, universeComputer, connectionComputer, tribeComputer, true);
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
