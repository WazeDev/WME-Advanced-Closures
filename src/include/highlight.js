WMEAC.refreshHighlight = function ()
{
    try
    {
        var l = W.map.getLayerByUniqueName("closures");
        for (var m in l.markers)
        {
            if (!l.markers.hasOwnProperty(m)) continue;
            var marker = l.markers[m];
            if (marker.model.reason &&
                marker.model.reason.length>=1 && 
                marker.model.reason.charCodeAt(marker.model.reason.length-1)==160)
                marker.icon.$div.addClass('wmeac-hl');
        }
    }
    catch (e) {
        WMEAC.log("Highlight error: ", e);
    }
};