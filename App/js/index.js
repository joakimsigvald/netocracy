var simulation = null;

function startSimulation() {
    simulation = createSimulation(true);
    $('#startSimulationBtn').hide();
    $('#addIndividualBtn').show();
    simulation.start();
    $(document).keypress(function (e) {
        if (e.which === 13) {
            addIndividual();
        }
    });
}

function addIndividual() {
    simulation.addIndividual();
}
