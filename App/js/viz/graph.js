"use strict";

//Specification: https://docs.google.com/document/d/1a0LRTN9ta6nwODoeKM3mUHrLAL_PDSnsUVLHIWhLJcA/edit?usp=sharing
var createGraph = function (naming, simulationData, dark) {
    $('#viz_canvas').css('background-color', dark ? 'black' : 'white');
    var svg = d3.select("#viz_canvas").append("svg");
    var chartLayer = svg.append("g").classed("chartLayer", true);
    var selection = createSelection(dark);
    var graphData, simulation, link, node;
    var chartWidth, chartHeight;

    function draw() {
        computeDimensions();
        graphData = createGraphData(naming, simulationData, chartWidth, chartHeight, dark);
        drawChart(graphData.getNodes(), graphData.getLinks());
    }

    function computeDimensions() {
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
                .id(d => d.id)
                .strength(d => (d.strength.xy + d.strength.yx) / 2))
                .force("collide", d3.forceCollide(d => d.bounds).iterations(16));
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
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("transform", d => "translate(" + d.x + "," + d.y + ")");
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
        link.attr("stroke", l => getLinkColor(l.strength))
            .attr("stroke-width", 5)
            .attr("style", l => "stroke-opacity: " + (Math.abs(l.strength.xy) + Math.abs(l.strength.yx)) / 2);
    }

    function getLinkColor(strength) {
        const g = strength.xy < 0 ? 0 : strength.xy > 0 ? 255 : 127;
        const b = strength.yx < 0 ? 0 : strength.yx > 0 ? 255 : 127;
        const r = 255 - ~~((b + g) / 2);
        return `rgb(${r},${g},${b})`;
    }

    function visualizeNode(node) {
        node = node.append("g");
        node.append("circle");
        decorateNode(node);
        labelNode(node);
        selection.hookup(node);
        return node;
    }

    function decorateNode(node) {
        node.selectAll("circle")
            .attr("r", d => d.r)
            .attr("fill", d => d.color);
    }

    function labelNode(node) {
        if (node._groups.length > 100)
            return;
        node.append("text")
            .attr("text-anchor", "middle")
            .attr("dx", 0)
            .attr("dy", ".35em")
            .attr('pointer-events', 'none')
            .style('fill', dark ? 'white' : 'black')
            .text(d => d.label);
    }

    function updateNodesAndLinks(nodesToUpdate, linksToUpdate) {
        decorateNode(node.filter(n => nodesToUpdate.indexOf(n.id) > -1));
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
        if (updated.addedOrRemoved) {
            replaceNodesAndLinks(graphData.getNodes(), graphData.getLinks());
            updateNodesAndLinks(updated.nodesToUpdate, updated.linksToUpdate);
            updateSimulation(true);
        }
        else if (updated.nodesToUpdate.length + updated.linksToUpdate.length) {
            updateNodesAndLinks(updated.nodesToUpdate, updated.linksToUpdate);
            updateSimulation(false);
        }
    }

    function updateSimulation(rearrange) {
        simulation.alphaTarget(rearrange ? 0.2 : 0.1).restart();
        setTimeout(() => simulation.alphaTarget(0), rearrange ? 400 : 200);
    }

    return {
        draw: draw,
        update: update,
        getSelectedIndividual: selection.getSelectedEntity
    };
}