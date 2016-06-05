WMEAC.bootstrapAC = function ()
{
    window.setTimeout(WMEAC.initialize, 500);
};


WMEAC.initialize = function ()
{
    WMEAC.log ("init");
    WMEAC.waitForWaze(function () {
        WMEAC.load();
        WMEAC.log("presets", WMEAC.presets);
        WMEAC.initUI();
    });
    WMEAC.log ("init done");
};


WMEAC.waitForWaze = function(handler)
{
    var APIRequired=[{o: "Waze"},
                     {o: "Waze.model"},
                     {o: "Waze.map"},
                     {o: "Waze.loginManager"}
                    ];
    for (var i=0; i<APIRequired.length; i++)
    {
        var path=APIRequired[i].o.split('.');
        var object=window;
        for (var j=0; j<path.length; j++)
        {
            object=object[path[j]];
            if (typeof object == "undefined" || object == null)
            {
                window.setTimeout(function () { WMEAC.waitForWaze(handler); }, 500);
                return;
            }
        }
    }
    
    
    var userInfo = WMEAC.getId('user-info');
    if (userInfo==null)
    {
        window.setTimeout(function () { WMEAC.waitForWaze(handler); }, 500);
        return;
    }

    var navTabs=userInfo.getElementsByTagName('ul');
    if (navTabs.length==0)
    {
        window.setTimeout(function () { WMEAC.waitForWaze(handler); }, 500);
        return;
    }
    if (typeof(navTabs[0])=='undefined')
    {
        window.setTimeout(function () { WMEAC.waitForWaze(handler); }, 500);
        return;
    }

    var tabContents=userInfo.getElementsByTagName('div');
    if (tabContents.length==0)
    {
        window.setTimeout(function () { WMEAC.waitForWaze(handler); }, 500);
        return;
    }
    if (typeof(tabContents[0])=='undefined')
    {
        window.setTimeout(function () { WMEAC.waitForWaze(handler); }, 500);
        return;
    }

    handler();
};

