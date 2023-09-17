WMEAC.bootstrapAC = function ()
{
    if (W?.userscripts?.state?.isReady) {
        WMEAC.initialize();
    } else {
        document.addEventListener("wme-ready", WMEAC.initialize, {
            once: true,
        });
    }
};


WMEAC.initialize = function ()
{
    WMEAC.log ("init");
    WMEAC.load();
    WMEAC.log("presets", WMEAC.presets);
    WMEAC.initUI();
    WMEAC.log ("init done");
};


