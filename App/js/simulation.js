"use strict";

//Specification: https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
var createSimulation = function () {
    var chartWidth, chartHeight;
    var svg = d3.select("#viz_canvas").append("svg");
    var chartLayer = svg.append("g").classed("chartLayer", true);
    var data, simulation, link, node;

    function start() {
        setSize();
        data = createSimulationData(chartWidth, chartHeight);
        visualize();
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

        svg.attr("width", chartWidth).attr("height", chartHeight);

        chartLayer
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("transform", "translate(" + [0, upperMargin] + ")");

        if (simulation) {
            setForceCenter();
        }
    }

    function visualize() {
        const joinStrings = strArr => {
            if (strArr.length == 0)
                return '';
            if (strArr.length == 1)
                return strArr[0];
            const last = strArr.pop();
            return `${strArr.join(', ')} and ${last}`;
        }

        const tribeless = data.universe.filter(i => !i.tribe);
        const summary =
            `
Generated tribes ${joinStrings(data.tribes.map(t => t.name))} from ${joinStrings(data.universe.map(t => data.firstAndLast(t.name)))}.
${tribeless.length ? joinStrings(tribeless.map(t => data.firstAndLast(t.name))) : 'None'} ${tribeless.length === 1 ? 'was' : 'were'} left without a tribe.
`;
        $('#controlPane').html(summary);
        drawChart();
    }

    function drawChart() {
        simulation = d3.forceSimulation()
            .force('charge', d3.forceManyBody())
            .force("link", d3.forceLink()
                .id(function (d) { return d.id; })
                .strength(function (d) { return Math.min(1, d.strength); }))
            .force("collide", d3.forceCollide(function (d) { return d.bounds; }).iterations(16));
        setForceCenter();
        link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(data.links)
            .enter();
        link = visualizeLink(link);

        node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(data.nodes)
            .enter().append("g");

        var ticked = function () {
            link
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            node
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
        };

        simulation
            .nodes(data.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(data.links);

        visualizeNode();
    }

    function setForceCenter() {
        simulation.force("center", d3.forceCenter(chartWidth / 2, chartHeight / 2))
            .force('x', d3.forceX(chartWidth / 2).strength(0.5))
            .force("y", d3.forceY(chartHeight / 2).strength(0.5));
    }

    function visualizeLink(link) {
        link = link.append("line");
        decorateLink(link);
        return link;
    }

    function decorateLink(link) {
        link.attr("stroke", "black")
            .attr("stroke-width", function (l) {
                return Math.max(1, l.strength);
            })
            .attr("style", function (l) { return "stroke-opacity: " + Math.min(1, l.strength); });
    }

    function visualizeNode() {
        node.append("g")
            .append("circle")
            .attr("r", d => d.r)
            .attr("fill", d => d.color);
        labelNode();
    }

    function labelNode() {
        node.append("text")
            .attr("text-anchor", "middle")
            .attr("dx", 0)
            .attr("dy", ".35em")
            .attr('pointer-events', 'none')
            .text(function (d) {
                return d.label;
            });
    }


    return {
        start: start
    };
}