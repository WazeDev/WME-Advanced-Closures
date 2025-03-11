WMEAC.bootstrapAC = function ()
{
    document.addEventListener("wme-ready", WMEAC.initialize, {
        once: true,
    });
};


WMEAC.initialize = function ()
{
    // initialize the sdk with your script id and script name
    WMEAC.wmeSDK = getWmeSdk({scriptId, scriptName});

    WMEAC.log ("init v" + WMEAC.ac_version);
    WMEAC.load();
    WMEAC.log("presets", WMEAC.presets);
    WMEAC.initUI();
    WMEAC.log ("init done");
};


