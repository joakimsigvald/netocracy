"use strict";

//Specification: https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
var createSimulation = function (fullscreen) {
    var chartWidth, chartHeight;
    //var svg = d3.select("#viz_canvas").append("svg");
    //var chartLayer = svg.append("g").classed("chartLayer", true);
    var data, simulation, link, node, dragAndDrop;

    function init() {
        fullscreen.hookup(setSize, update);        
        data = createSimulationData(chartWidth, chartHeight);
        //drawChart();
    }

    function start() {
        $('#viz_canvas').html('Simulation started!');
        var connections = data.computeConnections();
        var tribes = data.computeTribes(connections);
        visualize(data.getUniverse(), tribes);
    }

    function setSize() {
        var panel = document.querySelector("#viz_panel");
        var graph = document.querySelector("#viz_canvas");
        var upperMargin = document.querySelector("#controlPane").clientHeight;
        var outerHeight = window.innerHeight - upperMargin;
        panel.style.height = `${(outerHeight | 0)}px`;
        graph.style.height = `${(outerHeight | 0)}px`;
        chartWidth = window.innerWidth;
        chartHeight = outerHeight;

        //svg.attr("width", chartWidth).attr("height", chartHeight);

        //chartLayer
        //    .attr("width", chartWidth)
        //    .attr("height", chartHeight)
        //    .attr("transform", "translate(" + [0, upperMargin] + ")");

        if (simulation) {
            setForceCenter();
        }
    }

    function visualize(universe, tribes) {
        const joinStrings = strArr => {
            if (strArr.length == 0)
                return '';
            if (strArr.length == 1)
                return strArr[0];
            const last = strArr.pop();
            return `${strArr.join(', ')} and ${last}`;
        }

        const firstAndLast = name => `${name.first} ${name.last}`;

        const tribeless = universe.filter(i => !i.tribe);

        $('#viz_canvas').html(
            `
Generated tribes ${joinStrings(tribes.map(t => t.name))} from ${joinStrings(universe.map(t => firstAndLast(t.name)))}.
${tribeless.length ? joinStrings(tribeless.map(t => firstAndLast(t.name))) : 'None'} ${tribeless.length === 1 ? 'was' : 'were'} left without a tribe.
`);
    }

    function update() {
    }

    return {
        init: init,
        start: start,
        update: update
    };
}