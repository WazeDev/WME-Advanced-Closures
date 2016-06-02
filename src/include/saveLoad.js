WMEAC.save = function ()
{
    WMEAC.log("save data...");
    localStorage.WMEAC = JSON.stringify(WMEAC.data);
};

WMEAC.load = function ()
{
    try
    {
        WMEAC.data = JSON.parse(localStorage.WMEAC);
    }
    catch (err) 
    {
        WMEAC.log("Error while loading data from storage: " , err);
    }
};
