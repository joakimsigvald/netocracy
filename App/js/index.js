var simulation = null;

function startSimulation() {
    simulation = createSimulation(true);
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
