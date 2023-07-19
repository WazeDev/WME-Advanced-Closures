WMEAC.refreshHighlight = function ()
{
    try
    {
        var l = W.map.getLayerByName("closures");
        for (var m in l.markers)
        {
            if (!l.markers.hasOwnProperty(m)) continue;
            var marker = l.markers[m];
            // 2023-07-15 closure marker doesnt have model anymore, use chaining to avoid error
            // TODO - find way to get closure details from marker
            if (marker.model?.reason &&
                marker.model.reason.length>=1 && 
                marker.model.reason.charCodeAt(marker.model.reason.length-1)==160)
                marker.icon.$div.addClass('wmeac-hl');
        }
    }
    catch (e) {
        WMEAC.log("Highlight error: ", e);
    }
};