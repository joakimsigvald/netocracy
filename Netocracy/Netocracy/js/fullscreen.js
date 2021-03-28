"use strict";

var createFullscreen = function () {
    var mySetSize, myUpdate;

    if (document.addEventListener) {
        document.addEventListener('fullscreenchange', fullscreenHandler, false);
        document.addEventListener('mozfullscreenchange', fullscreenHandler, false);
        document.addEventListener('MSFullscreenChange', fullscreenHandler, false);
        document.addEventListener('webkitfullscreenchange', fullscreenHandler, false);
        window.addEventListener('resize', fullscreenHandler, false);
    }

    function fullscreenHandler() {
        if (mySetSize)
            mySetSize(isFullscreen());
        if (myUpdate)
            myUpdate();
    }

    function isFullscreen() {
        return document.webkitIsFullScreen || document.mozFullScreen || !!document.msFullscreenElement;
    }

    function hookup(setSize, update) {
        mySetSize = setSize;
        myUpdate = update;
        mySetSize(isFullscreen());
    }

    return {
        hookup: hookup,
        openFullscreen: openFullscreen
    };
};

function openFullscreen(elem) {
    var elem = document.getElementById('vizWindow');
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}