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

WMEAC.setDraggable = function (element, options)
{
    if (!options.hasOwnProperty('controller'))
        options.controller=element;
    if (!options.hasOwnProperty('container'))
        options.container=$('body');
    
    options.controller.css({cursor: 'move'});

    options.controller.on("mousedown", function(e) {
        var x = e.pageX-element.offset().left;
        var y = e.pageY-element.offset().top;

        $('body').on("mouseup", function(e) {
            options.container.off("mousemove", elemmousemove);
               
        });
    
        function elemmousemove (e) {
            e.preventDefault();
            element.offset({
                top: e.pageY  - y,
                left: e.pageX - x
            });
        }
    
        options.container.on("mousemove",  elemmousemove);

    });
};

WMEAC.dateTimeOverlaps = function ( dt1, dt2 )
{
    return (dt1.startDate < dt2.endDate && dt1.endDate > dt2.startDate );
};

WMEAC.solveOverlaps = function (closureToAdd, existingClosureList, mode)
{
    // sort existing closures:
    var ecs = existingClosureList.map(function (e) {
        return { isNew: false, ref: e, startDate: e.startDate, endDate: e.endDate};
    }); 
    // append new
    closureToAdd.isNew=true;
    ecs.push(closureToAdd);
    var changes=true;
    
    while (changes)
    {
        changes=false;
        ecs.sort(function (a, b) {
            return (new Date(a.startDate) - new Date(b.startDate));
        });

        for (var i=1; i<ecs.length; i++)
        {
            if (WMEAC.dateTimeOverlaps(ecs[i-1], ecs[i]))
            {
                var indexOfNew = i-1;
                var indexOfExisting = i;
                if (ecs[i].isNew)
                {
                    indexOfNew=i;
                    indexOfExisting=i-1;
                }
                var r1 = ecs[indexOfNew];
                var r2 = ecs[indexOfExisting];
                var range1={};
                var range2={};
                switch (mode)
                {
                    case 0: // keep existing. return empty
                    return [];
                    break;
                    
                    case 1: // delete existing.
                    ecs.splice(indexOfExisting, 1);
                    changes=true;
                    break;
                    
                    case 2: // fill: keep all existing and cut/split new
                    range1.start=new Date(r1.startDate);
                    range1.end=new Date(r1.endDate);
                    range2.start=new Date(r2.startDate);
                    range2.end=new Date(r2.endDate);
                    changes=true;
                    if (range1.start>=range2.start && range1.end<=range2.end)
                    {
                        ecs.splice(indexOfNew, 1);
                    }
                    else if (range1.start<range2.start && range1.end>range2.end)
                    {
                        ecs.push({isNew: true, startDate: r2.endDate, endDate: r1.endDate});
                        r1.endDate=r2.startDate;
                    }
                    else if (range1.start<range2.start)
                    {
                        r1.endDate=r2.startDate;
                    }
                    else //if (range1.end>range2.end)
                    {
                        r1.startDate = r2.endDate;
                    }
                    break;
                    
                    case 3: // force: cut/split/delete existing and keep new
                    range1.start=new Date(r1.startDate);
                    range1.end=new Date(r1.endDate);
                    range2.start=new Date(r2.startDate);
                    range2.end=new Date(r2.endDate);
                    changes=true;
                    if (range1.start>range2.start && range1.end<range2.end)
                    {
                        ecs.push({isNew: false, startDate: r1.endDate, endDate: r2.endDate, ref: r2.ref});
                        r2.endDate=r1.startDate;
                    }
                    else if (range1.start<=range2.start && range1.end>=range2.end)
                    {
                        ecs.splice(indexOfExisting, 1);
                    }
                    else if (range1.start<range2.start)
                    {
                        r2.startDate=r1.endDate;
                    }
                    else //if (range1.end>range2.end)
                    {
                        r2.endDate = r1.startDate;
                    }
                    break;
                }
            }
        }
    }
    return ecs;
};

// tests:
// WMEAC.solveOverlaps({startDate: '2016-01-10 00:00', endDate: '2016-01-20 00:00'},
    // [ {startDate: '2016-01-05 00:00', endDate: '2016-01-15 00:00', reason: 'bla bla'}], 0);
// WMEAC.solveOverlaps({startDate: '2016-01-10 00:00', endDate: '2016-01-20 00:00'},
    // [ {startDate: '2016-01-15 00:00', endDate: '2016-01-25 00:00', reason: 'bla bla'}], 0);
// WMEAC.solveOverlaps({startDate: '2016-01-10 00:00', endDate: '2016-01-20 00:00'},
    // [ {startDate: '2016-01-05 00:00', endDate: '2016-01-25 00:00', reason: 'bla bla'}], 0);
// WMEAC.solveOverlaps({startDate: '2016-01-10 00:00', endDate: '2016-01-20 00:00'},
    // [ {startDate: '2016-01-12 00:00', endDate: '2016-01-18 00:00', reason: 'bla bla'}], 0);
// WMEAC.solveOverlaps({startDate: '2016-01-10 00:00', endDate: '2016-01-20 00:00'},
    // [ {startDate: '2016-01-10 00:00', endDate: '2016-01-20 00:00', reason: 'bla bla'}], 0);
// WMEAC.solveOverlaps({startDate: '2016-01-10 00:00', endDate: '2016-01-20 00:00'},
    // [ {startDate: '2016-01-05 00:00', endDate: '2016-01-10 00:00', reason: 'bla bla'},
      // {startDate: '2016-01-20 00:00', endDate: '2016-01-25 00:00', reason: 'bla bla'}], 0);
// WMEAC.solveOverlaps({startDate: '2016-01-10 00:00', endDate: '2016-01-20 00:00'},
    // [ {startDate: '2016-01-05 00:00', endDate: '2016-01-15 00:00', reason: 'bla bla'},
      // {startDate: '2016-01-16 00:00', endDate: '2016-01-25 00:00', reason: 'bla bla'}], 0);