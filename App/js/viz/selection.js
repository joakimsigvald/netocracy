"use strict";

function createSelection(dark) {
    var selectedEntity = null;

    function hookup(node) {
        node.selectAll('circle')
            .attr("class", d => "bubble bubble" + d.id)
            .style('cursor', 'pointer');
        node.on("click", toggleSelection);
    }

    function toggleSelection(entity) {
        if (entity)
            entity.isSelected = !entity.isSelected;
        if (selectedEntity) {
            selectedEntity.isSelected = false;
            setSelectedAppearance(getAllBubbles(), false);
        }
        selectedEntity = entity && entity.isSelected ? entity : null;
        if (selectedEntity) {
            setSelectedAppearance(getBubble(selectedEntity.id), true);
        }
    }

    var getAllBubbles = () => d3.selectAll(".bubble");
    var getBubble = id => d3.select(".bubble" + id);

    function setSelectedAppearance(element, isSelected) {
        element.style("stroke", isSelected ? (dark ? 'white' : 'black') : null);
        element.style("stroke-width", isSelected ? 3 : null);
    }

    return {
        hookup: hookup,
        getSelectedEntity: () => selectedEntity
    };
}