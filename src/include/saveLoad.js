WMEAC.save = function ()
{
    WMEAC.log("save data...");
    localStorage.WMEAC = JSON.stringify({presets: WMEAC.presets});
};

WMEAC.load = function ()
{
    try
    {
        if (localStorage.WMEAC!==undefined && localStorage.WMEAC.length > 0) {
            var saved = JSON.parse(localStorage.WMEAC);
            WMEAC.presets = saved.presets;
            WMEAC.log("presets", WMEAC.presets);
        }
    }
    catch (err) 
    {
        WMEAC.log("Error while loading data from storage: " , err);
    }
};
