var simulation = null;

function startSimulation() {
    simulation = createSimulation(true);
    $('#startSimulationBtn').hide();
    $('#updateSimulationBtn').show();
    simulation.start();
}

function updateSimulation() {
    simulation.update();
}