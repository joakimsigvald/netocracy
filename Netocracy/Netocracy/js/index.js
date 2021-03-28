function startSimulation() {
    var fullscreen = createFullscreen();
    var simulation = createSimulation(fullscreen);
    simulation.init();
    openFullscreen();
    simulation.start();
}