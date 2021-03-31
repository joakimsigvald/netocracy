"use strict";

//Specification: https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
var createGraph = function (simulationData) {
    var chartWidth, chartHeight;
    var svg = d3.select("#viz_canvas").append("svg");
    var chartLayer = svg.append("g").classed("chartLayer", true);
    var graphData, simulation, link, node;

    function draw() {
        setSize();
        graphData = createGraphData(simulationData, chartWidth, chartHeight);
        drawChart();
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
            .data(graphData.links)
            .enter();
        link = visualizeLink(link);

        node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graphData.nodes)
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
            .nodes(graphData.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graphData.links);

        node = visualizeNode(node);
    }

    function setForceCenter() {
        simulation.force("center", d3.forceCenter(chartWidth / 2, chartHeight / 2))
            .force('x', d3.forceX(chartWidth / 2).strength(0.5 * chartHeight / chartWidth))
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

    function visualizeNode(node) {
        node.append("g")
            .append("circle");
        decorateNode(node);
        labelNode(node);
        return node;
    }

    function decorateNode(node) {
        node.selectAll("circle")
            .attr("r", d => d.r)
            .attr("fill", d => d.color);
    }

    function labelNode(node) {
        node.append("text")
            .attr("text-anchor", "middle")
            .attr("dx", 0)
            .attr("dy", ".35em")
            .attr('pointer-events', 'none')
            .text(function (d) {
                return d.label;
            });
    }

    function updateNodesAndLinks(nodesToUpdate, linksToUpdate) {
        decorateNode(node.filter(n => nodesToUpdate.indexOf(n.id) !== -1));
        decorateLink(link.filter(l => linksToUpdate.indexOf(l.id) !== -1));
        simulation.force("link").initialize(simulation.nodes());
        simulation.force("collide").initialize(simulation.nodes());
    }

    function replaceNodesAndLinks() {
        node = node.data(graphData.nodes, function (d) { return d.id; });
        node.exit().remove();
        node = visualizeNode(node.enter()).merge(node);

        link = link.data(graphData.links, function (d) { return d.id; });
        link.exit().remove();
        link = visualizeLink(link.enter()).merge(link);

        simulation.nodes(graphData.nodes);
        simulation.force("link").links(graphData.links);
    }

    function update(simulationData) {
        var updated = graphData.update(simulationData, chartWidth, chartHeight);
        if (updated.nodesToUpdate.length + updated.linksToUpdate.length > 0) {
            updateNodesAndLinks(updated.nodesToUpdate, updated.linksToUpdate);
        }
        if (updated.addedOrRemoved) {
            replaceNodesAndLinks();
            updateSimulation(true);
        }
        else
            updateSimulation(false);
    }

    function updateSimulation(rearrange) {
        simulation.alphaTarget(rearrange ? 0.2 : 0.1).restart();
        setTimeout(function () { simulation.alphaTarget(0); }, rearrange ? 400 : 200);
    }

    return {
        draw: draw,
        update: update
    };
}