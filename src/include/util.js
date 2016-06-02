WMEAC.getElementsByClassName=function (classname, node) {
    if(!node) node = document.getElementsByTagName("body")[0];
    var a = [];
    var re = new RegExp('\\b' + classname + '\\b');
    var els = node.getElementsByTagName("*");
    for (var i=0,j=els.length; i<j; i++)
        if (re.test(els[i].className)) a.push(els[i]);
            return a;
};


WMEAC.removeChildElements = function (node)
{
    while (node.firstChild)
    {
        WMEAC.removeChildElements(node.firstChild);
        node.removeChild(node.firstChild);
    }
};

WMEAC.createElement = function (options)
{
    if (options.hasOwnProperty('type')==false)
        return null;
    var el=document.createElement(options.type);

    if (options.hasOwnProperty('id')==true)
        el.id=options.id;

    if (options.hasOwnProperty('className')==true)
        el.className=options.className;

    return el;
};

WMEAC.getId = function (node) {
    var el = document.getElementById(node);
    return el;
};

WMEAC.logBeta = function (msg, obj)
{
    //log("Beta - " + msg, obj);
};

WMEAC.logDebug = function (msg, obj)
{
    if (WMEAC.isDebug) WMEAC.log("DEBUG - " + msg, obj);
};


WMEAC.log = function (msg, obj)
{
    if (obj==null)
        console.log("Advanced closures v" + WMEAC.ac_version + " - " + msg);
    else
        console.debug("Advanced closures v" + WMEAC.ac_version + " - " + msg + " " ,obj);
};

WMEAC.isValidDate = function(d) // http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
{
    if ( Object.prototype.toString.call(d) === "[object Date]" ) {
        // it is a date
        if ( isNaN( d.getTime() ) ) {  // d.valueOf() could also work
            return false;
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }  
};

WMEAC.dateToClosureStr = function(d) {
   var yyyy = d.getUTCFullYear().toString();
   var MM = (d.getUTCMonth()+1).toString(); // getMonth() is zero-based
   var dd  = d.getUTCDate().toString();
   var hh = d.getUTCHours().toString();
   var mm = d.getUTCMinutes().toString();
   return yyyy + '-' + (MM[1]?MM:"0"+MM[0]) + '-' + (dd[1]?dd:"0"+dd[0]) + ' ' + (hh[1]?hh:"0"+hh[0]) + ':' + (mm[1]?mm:"0"+mm[0]); // padding
};


// http://stackoverflow.com/questions/8493195/how-can-i-parse-a-csv-string-with-javascript
WMEAC.CSVtoArray = function (text) {
    var b = [];
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    
    var lines = text.split('\n');
    lines.forEach(function (line) {
        if (!re_valid.test(line)) return;
        var a = [];                     // Initialize array to receive values.
        line.replace(re_value, // "Walk" the string using replace with callback.
            function(m0, m1, m2, m3) {
                // Remove backslash from \' in single quoted values.
                if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
                // Remove backslash from \" in double quoted values.
                else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
                else if (m3 !== undefined) a.push(m3);
                return ''; // Return empty string.
            });
        // Handle special case of empty last value.
        if (/,\s*$/.test(line)) a.push('');
        b.push(a);
    });
    return b;
};

WMEAC.segmentsIDsToSegments = function (ids)
{
    return ids.filter(function (e) {
        return (Waze.model.segments.objects.hasOwnProperty(e));
    }).map (function (e) {
        return (Waze.model.segments.objects[e]);
    });
};

WMEAC.reloadRoadLayer = function ()
{
    var l=Waze.map.getLayersBy("uniqueName","roads")[0];
    l.redraw({force:!0});
    l.removeBackBuffer();
    Waze.controller.reload();  
};

WMEAC.reloadClosuresLayer = function ()
{
    var l=Waze.map.getLayersBy("uniqueName","closures")[0];
    l.redraw({force:!0});
    Waze.controller.reload();  
};