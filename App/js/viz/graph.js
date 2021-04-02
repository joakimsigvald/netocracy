"use strict";

//Specification: https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
var createGraph = function (simulationData, dark) {
    var chartWidth, chartHeight;
    $('#viz_canvas').css('background-color', dark ? 'black' : 'white');

    var svg = d3.select("#viz_canvas").append("svg");
    var chartLayer = svg.append("g").classed("chartLayer", true);
    var graphData, simulation, link, node;

    function draw() {
        setSize();
        graphData = createGraphData(simulationData, chartWidth, chartHeight, dark);
        drawChart(graphData.getNodes(), graphData.getLinks());
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

    function drawChart(nodes, links) {
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
            .data(links)
            .enter();
        link = visualizeLink(link);

        node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
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
            .nodes(nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(links);

        visualizeNode(node);
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
        link.attr("stroke", dark ? "white" : 'black')
            .attr("stroke-width", function (l) {
                return 4 * Math.max(1, l.strength);
            })
            .attr("style", function (l) { return "stroke-opacity: " + Math.min(1, l.strength); });
    }

    function visualizeNode(node) {
        node = node.append("g");
        node.append("circle");
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
            .style('fill', dark ? 'white' : 'black')
            .text(function (d) {
                return d.label;
            });
    }

    function updateNodesAndLinks(nodesToUpdate, linksToUpdate) {
        decorateNode(node.filter(n => {
            return nodesToUpdate.indexOf(n.id) > -1;
        }));
        decorateLink(link.filter(l => linksToUpdate.indexOf(l.id) > -1));
        simulation.force("link").initialize(simulation.nodes());
        simulation.force("collide").initialize(simulation.nodes());
    }

    function replaceNodesAndLinks(nodes, links) {
        node = node.data(nodes, function (d) { return d.id; });
        node.exit().remove();
        node = visualizeNode(node.enter()).merge(node);

        link = link.data(links, function (d) { return d.id; });
        link.exit().remove();
        link = visualizeLink(link.enter()).merge(link);

        simulation.nodes(nodes);
        simulation.force("link").links(links);
    }

    function update(simulationData) {
        var updated = graphData.update(simulationData, chartWidth, chartHeight);
        if (updated.nodesToUpdate.length + updated.linksToUpdate.length) {
            updateNodesAndLinks(updated.nodesToUpdate, updated.linksToUpdate);
        }
        if (updated.addedOrRemoved) {
            replaceNodesAndLinks(graphData.getNodes(), graphData.getLinks());
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