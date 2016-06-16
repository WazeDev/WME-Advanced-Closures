WMEAC.parseCSV = function (csvString)
{
    if (csvString!=null)
    {
        var csvArray = WMEAC.CSVtoArray(csvString);
        WMEAC.log("CSV as array:", csvArray);
        var isValid = WMEAC.csv[0].validate(csvArray);
        if (isValid.isValid)
        {
            WMEAC.log("CSV is valid!");
            var closures = WMEAC.csv[0].filter(csvArray).map(function (e, i) {
                return {action: e[0], closure: new WMEAC.ClassClosure({reason:e[1], location:e[2], startDate:e[3], endDate:e[4], direction:e[5], segIDs:e[7], lonlat:e[8], permanent:e[6], zoom: e[9], id: i}), UI: null};
            });
            WMEAC.log("Closure list:", closures);
            WMEAC.csvCurrentClosureList = closures;
            var listUI = WMEAC.getId('wmeac-csv-closures-list-elts');
            // remove all closures before:
            WMEAC.removeChildElements(listUI);
            closures.forEach(function (c) {
                c.UI = WMEAC.buildInlineClosureUI(c.closure, c.action);
                listUI.appendChild(c.UI);
            });
            WMEAC.csvShowList(true);
            WMEAC.csvAddLog("CSV parse successful\n");
            return true;
            // aply closures: TEST ONLY: this should not be done there!
            /*closures.forEach(function (c) {
                c.closure.applyInWME(function () { WMEAC.log("Closure success:", c);});
            });*/
            // END OF aply closures: TEST ONLY: this should not be done there!
        }
        else
        {
            WMEAC.log("CSV is NOT valid!:" + isValid.feedBack + "\n");
            WMEAC.csvAddLog(isValid.feedBack + '\n');
            WMEAC.csvShowList(false);
            WMEAC.csvCurrentClosureList = null;
            return false;
        }
        return false;
    }
    return false;
};

WMEAC.CSVFileChanged = function (evt)
{
    var files = evt.target.files; // FileList object
    for (var i = 0, f; f = files[i]; i++)
    {
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                WMEAC.log("import CSV file read");
                WMEAC.csvClearLog();
                if (WMEAC.parseCSV(e.target.result))
                {
                    WMEAC.csvCurrentBatchClosureList=WMEAC.csvCurrentClosureList.slice();
                    // WMEAC.csvCheckAllSegments(-1);
                }
            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsText(f);
    }
    this.value = null;
    WMEAC.getId('wmeac-csv-closures-controls-check').checked=false;
};

WMEAC.ClassCSV = function (options)
{
    this.isValid=false;
    if (options.hasOwnProperty('version'))
        this.version=options.version;
    else return;
    if (options.hasOwnProperty('regexpValidation'))
        this.regexpValidation=options.regexpValidation;
    else return;
    this.isValid=true;
    
    this.validate = function(data)
    {
        var regexps = this.regexpValidation;
        var feedBack = "";
        this.filter(data).forEach(function (line, l) {
            var isLineValid = line.reduce(function (stillValid, cell, i) {
                var isCellValid = cell.match(regexps[i])!=null;
                if (!isCellValid)
                    feedBack+="Error while parsing line " + l + " cell " + i + ": \"" + cell + "\" in line " + line.join(',');
                return (stillValid && isCellValid);
            }, true);
        }, this);
        return {isValid: feedBack=="", feedBack: feedBack};
    };
    
    this.filter = function(data)
    {
        return data.filter(function (line) {
            // return (line.length>=1 && line[0]!="header" && line[0]!="comment");
            return (line.length>=1 && ['add','remove'].indexOf(line[0])!=-1);
        });
    };
};

WMEAC.csv.push(new WMEAC.ClassCSV({version: 1, regexpValidation: [/.*/, // 1st cell: action is free keyword. It will be filtered later
                                                                  /.*/, // reason is free
                                                                  /.*/, // location is free
                                                                  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, // start date
                                                                  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, // end date
                                                                  /(^A to B$)|(^B to A$)|(^TWO WAY$)/, // direction
                                                                  /(Yes)|(No)/, // ignore trafic = permanent
                                                                  /^(\d+(;|$))+/, // seg ID list
                                                                  /(lon=(-?\d+\.?\d*)&lat=(-?\d+\.?\d*))|(lat=(-?\d+\.?\d*)&lon=(-?\d+\.?\d*))/, // lonlat
                                                                  /^\d$/ // zoom
                                                                  ]}));
                                                                  
WMEAC.buildInlineClosureUI = function (closure, action)
{
    var liElt = WMEAC.createElement({type: 'li', className: 'wmeac-csv-closures-list-' + action});
    liElt.setAttribute('closureID', closure.id);
    liElt.innerHTML='<div class="wmeac-csv-closures-list-col-action"><input type="checkbox" /></div>\
                    <div class="wmeac-csv-closures-list-col-lr"><div title="' + closure.location + '">' + closure.location + '</div><div title="' + closure.reason + '">' + closure.reason + '</div></div>\
                    <div class="wmeac-csv-closures-list-col-dates"><div title="' + closure.startDate + '">' + closure.startDate + '</div><div title="' + closure.endDate + '">' + closure.endDate + '</div></div>\
                    <div class="wmeac-csv-closures-list-col-dir">' + (closure.direction=="A to B"?'A&#8594;B':(closure.direction=="B to A"?'B&#8594;A':'A&#8596;B')) + '</div>\
                    <div class="wmeac-csv-closures-list-col-it"><input type="checkbox" ' + (closure.permanent=="Yes"?'checked':'') + ' disabled/></div>\
                    <div class="wmeac-csv-closures-list-col-target"><a href="#" title="Go there!"><i class="fa fa-crosshairs"></i></a></div>\
                    <div class="wmeac-csv-closures-list-col-apply"><a href="#" title="Apply action of this closure"><i class="fa fa-arrow-circle-right"></i></a></div>\
                    <div class="wmeac-csv-closures-minilog" style="display: block;">' + (action=='add'?'Ready to apply':(action=='remove'?'Ready to remove':'')) + '</div>';
    // attach handlers
    liElt.children[5].children[0].addEventListener('click', function (e) {
        WMEAC.csvClearLog();
        // get closure id:
        var cid = parseInt(e.target.parentNode.parentNode.parentNode.getAttribute('closureID'));
        var closure = WMEAC.csvCurrentClosureList.find(function (c) {
            return (c.closure.id==cid);
        });
        WMEAC.log('Closure to target:', closure);
        var xy = OpenLayers.Layer.SphericalMercator.forwardMercator(closure.closure.lonlat.lon, closure.closure.lonlat.lat);
        Waze.map.setCenter(xy, closure.closure.zoom);
        var tmp3 = function selectSegments()
        {
            WMEAC.log("Now select segments...");
            var segs = WMEAC.segmentsIDsToSegments(closure.closure.segIDs);
            if (segs.length!=closure.closure.segIDs.length)
            {
                if (segs.length==0)
                {
                    WMEAC.csvAddLog("No segment found: " + closure.closure.location + "(" + closure.closure.reason + ")\n");
                    WMEAC.setCSVMiniLog(closure, "Selection failed: no segment found", 3);
                }
                else
                {
                    WMEAC.csvAddLog("Partial selection (" + segs.length + "/" + closure.closure.segIDs.length + "): " + closure.closure.location + "(" + closure.closure.reason + ")\n");
                    WMEAC.setCSVMiniLog(closure, "Partial selection: " + segs.length + "/" + closure.closure.segIDs.length, 2);
                }
                alert ("Warning: missing segments.\nFound " + segs.length + "/" + closure.closure.segIDs.length + " segment(s)");
            }
            else
            {
                WMEAC.csvAddLog("Selection ok (" + segs.length + "): " + closure.closure.location + "(" + closure.closure.reason + ")\n");
                WMEAC.setCSVMiniLog(closure, "Selection OK: " + segs.length, 1);
            }
            if (segs.length!=0)
                Waze.selectionManager.select(segs);
        };
        var tmp2 = function readyToSelect() {
            WMEAC.log("Test if ready to select...");
            if (WMEAC.pendingOps==true)
            {
                WMEAC.log("Not yet. Waiting for WME...");
                window.setTimeout(readyToSelect, 500);
            }
            else
            {
                tmp3();
            }
        };
        var tmp1 = function mapMovedEnd() {
            WMEAC.log("Test if roads are reloaded...");
            if (WMEAC.pendingOps==true)
            {
                WMEAC.log("Not yet. Waiting for WME...");
                window.setTimeout(mapMovedEnd, 500);
            }
            else
            {
                WMEAC.reloadRoadLayer();
                tmp2();
            }
        };
        window.setTimeout(tmp1, 500);

    });
    liElt.children[6].children[0].addEventListener('click', function (e) {
        // get closure id:
        WMEAC.csvClearLog();
        var liElt = e.target.parentNode.parentNode.parentNode;
        var cid = parseInt(liElt.getAttribute('closureID'));
        var closure = WMEAC.csvCurrentClosureList.find(function (c) {
            return (c.closure.id==cid);
        });
        WMEAC.log('Closure to apply:', closure);
        WMEAC.csvApplyClosure(closure, null);
        
    });
    return liElt;
};

WMEAC.csvApplyClosure = function(closure, handler)
{
    var xy = OpenLayers.Layer.SphericalMercator.forwardMercator(closure.closure.lonlat.lon, closure.closure.lonlat.lat);
    Waze.map.setCenter(xy, closure.closure.zoom);
    function applySuccess(evt)
    {
        WMEAC.csvAddLog("Closure OK: " + closure.closure.location + "(" + closure.closure.reason + ")\n");
        closure.UI.className="wmeac-csv-closures-list-done";
        WMEAC.setCSVMiniLog(closure, "OK", 1);
        handler && handler(true);
    };
    function applyFailure(evt)
    {
        //WMEAC.log('evt', evt);
        var details="";
        evt.forEach(function (err) {
            if (err.hasOwnProperty('attributes') && err.attributes.hasOwnProperty('details'))
                details += err.attributes.details + "\n";
        });
        WMEAC.csvAddLog("Closure KO: " + closure.closure.location + " (" + closure.closure.reason + ")\n" + details + "\n");
        WMEAC.setCSVMiniLog(closure, "KO: " + details, 3);
        closure.UI.className="wmeac-csv-closures-list-failed";
        handler && handler(false);
    };
    var tmp3 = function applyClosure()
    {
        WMEAC.log("Now apply closure...");
        closure.closure.applyInWME(applySuccess, applyFailure);
    };
    
    var tmp2 = function readyToApply() {
        WMEAC.log("Test if ready to apply...");
        if (WMEAC.pendingOps==true)
        {
            WMEAC.log("Not yet. Waiting for WME...");
            window.setTimeout(readyToApply, 500);
        }
        else
        {
            tmp3();
        }
    };
    var tmp1 = function mapMovedEnd() {
        WMEAC.log("Test if roads are reloaded...");
        if (WMEAC.pendingOps==true)
        {
            WMEAC.log("Not yet. Waiting for WME...");
            window.setTimeout(mapMovedEnd, 500);
        }
        else
        {
            WMEAC.reloadRoadLayer();
            tmp2();
        }
    };
    window.setTimeout(tmp1, 500);
};

WMEAC.csvAddLog = function(text)
{
    var divLog = WMEAC.getId('wmeac-csv-closures-log');
    divLog.innerHTML += text.replace(/\n/g, "<br>");
};

WMEAC.csvClearLog = function()
{
    var divLog = WMEAC.getId('wmeac-csv-closures-log');
    divLog.innerHTML = "";
};

WMEAC.csvShowList = function(show)
{
    var divList = WMEAC.getId('wmeac-csv-closures');
    divList.style.display=(show?"block":"none");
};

WMEAC.csvCheckAllSegments = function (i)
{
    if (i==-1) // firt call: init progressbar
    {
        WMEAC.pb.update(0);
        WMEAC.pb.show(true);
        // and call the check on first closure
        window.setTimeout(function () { WMEAC.csvCheckAllSegments(0); });
        return;
    }
    var continueSegmentCheck = function()
    {
        window.setTimeout(function () { WMEAC.csvCheckAllSegments(i+1); });
    };
    if (i<WMEAC.csvCurrentBatchClosureList.length)
    {
        var currentClosure = WMEAC.csvCurrentBatchClosureList[i];
        WMEAC.pb.update(i*100/WMEAC.csvCurrentBatchClosureList.length);
        WMEAC.pb.info("Scanning segments. please wait...");
        // check segments
        
        // catch window tile
        var c = OpenLayers.Layer.SphericalMercator.forwardMercator(currentClosure.closure.lonlat.lon, currentClosure.closure.lonlat.lat);
        var b = Waze.map.calculateBounds();
        
        var zoomRatio = Math.pow(2, Waze.map.zoom - currentClosure.closure.zoom);

        var w = b.getWidth()*Waze.controller.ratio*zoomRatio;
        var h = b.getHeight()*Waze.controller.ratio*zoomRatio;

        var tileBounds = new OpenLayers.Bounds(c.lon - w / 2, c.lat - h / 2, c.lon + w / 2, c.lat + h / 2);
        tileBounds=tileBounds.transform(Waze.map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326")).toBBOX();
        
        var roadTypes = (Waze.model.repos.segments.zoomToRoadType[currentClosure.closure.zoom]==-1?_.range(1, 22):Waze.model.repos.segments.zoomToRoadType[currentClosure.closure.zoom]);
        
        var WFVS = require("Waze/Feature/Vector/Segment");
        var aseg = new WFVS;
        
        var req = new XMLHttpRequest();
        req.open('GET', document.location.protocol + '//' + document.location.host + Waze.Config.api_base + '/Features?roadTypes=' + roadTypes.join('%2C') + '&problemFilter=0&mapUpdateRequestFilter=0&roadClosures=true&userAreas=false&managedAreas=false&majorTrafficEvents=false&bbox=' + encodeURIComponent(tileBounds) + '&language=en', true);
        req.onreadystatechange = function (e) {
            if (req.readyState == 4) {
                if(req.status == 200)
                {
                    //WMEAC.log(req.responseText);
                    try {
                        var data = JSON.parse(req.responseText);
                        WMEAC.log("data", data);
                        var existingSegs = currentClosure.closure.segIDs.filter(function (sid) {
                            return (data.segments.objects.find(function (seg) {
                                return (sid == seg.id);
                            })!=null);
                        });
                        var editableClosuresSegs = currentClosure.closure.segIDs.filter(function (sid) {
                            return (data.segments.objects.find(function (seg) {
                                return (sid == seg.id && (seg.permissions)&aseg.PERMISSIONS.EDIT_CLOSURES);
                            })!=null);
                        });
                        // look for closures on existing segs and build overlap list
                        var overlaps=[];
                        var existingClosures = existingSegs.forEach(function (sid) {
                            var cl = data.roadClosures.objects.filter(function (c) {
                                return (c.segID==sid);
                            });
                            console.log('cl', cl);
                            cl.forEach(function (c) {
                                var forwardMustBe = currentClosure.closure.direction=="A to B"?true:(currentClosure.closure.direction=="B to A"?false:null);
                                console.log('forwardMustBe', forwardMustBe);
                                console.log('dateTimeOverlaps', currentClosure.closure);
                                console.log('dateTimeOverlaps', c);
                                if (WMEAC.dateTimeOverlaps(currentClosure.closure, c))
                                {
                                    if (forwardMustBe==null || forwardMustBe==c.forward)
                                    {
                                        var segment = data.segments.objects.find(function (seg) {
                                            return seg.id==sid;
                                        });
                                        var streetName=null;
                                        if (segment && segment.primaryStreetID!=null)
                                        {
                                            var street = data.streets.objects.find(function (st) {
                                                return st.id==segment.primaryStreetID;
                                            });
                                            if (street && street.name!=null)
                                                streetName=street.name;
                                        }
                                        overlaps.push('Overlap with ' + c.reason + (streetName!=null?' :'+streetName:'') + ' (' + sid + ')');
                                    }
                                }
                            });
                        });
                        if (existingSegs.length == currentClosure.closure.segIDs.length &&
                            editableClosuresSegs.length == currentClosure.closure.segIDs.length &&
                            overlaps.length==0)
                        {
                            WMEAC.csvAddLog("Seg check OK: " + currentClosure.closure.location + " (" + currentClosure.closure.reason + "):\n" + existingSegs.length + " editable seg(s) found\n");
                            WMEAC.setCSVMiniLog(currentClosure, "segs OK: " + existingSegs.length + " editable seg(s) found", 1);
                        }
                        else if (existingSegs.length == currentClosure.closure.segIDs.length &&
                            editableClosuresSegs.length == currentClosure.closure.segIDs.length &&
                            overlaps.length!=0)
                        {
                            WMEAC.csvAddLog("Seg check KO: " + currentClosure.closure.location + " (" + currentClosure.closure.reason + "):\nOverlap detected on existing closures:\n" + overlaps.join('\n') + '\n');
                            WMEAC.setCSVMiniLog(currentClosure, "segs KO: " + overlaps.length + " overlap(s) detected", 2);
                        }
                        else if (existingSegs.length == currentClosure.closure.segIDs.length &&
                            editableClosuresSegs.length != currentClosure.closure.segIDs.length)
                        {
                            WMEAC.csvAddLog("Seg check KO: " + currentClosure.closure.location + " (" + currentClosure.closure.reason + "):\n" + existingSegs.length + "/" + currentClosure.closure.segIDs.length + " seg(s) found but " + (currentClosure.closure.segIDs.length-editableClosuresSegs.length) + " are not editable\n");
                            WMEAC.setCSVMiniLog(currentClosure, "segs KO: " + existingSegs.length + "/" + currentClosure.closure.segIDs.length + " seg(s) found and " + (currentClosure.closure.segIDs.length-editableClosuresSegs.length) + " are not editable", 2);
                        }
                        else
                        {
                            WMEAC.csvAddLog("Seg check KO: " + currentClosure.closure.location + " (" + currentClosure.closure.reason + "):\n" + existingSegs.length + "/" + currentClosure.closure.segIDs.length + " seg(s) found\n");
                            WMEAC.setCSVMiniLog(currentClosure, "segs KO: " + existingSegs.length + "/" + currentClosure.closure.segIDs.length + " seg(s) found", 3);
                        }
                    }
                    catch (err)
                    {
                        WMEAC.log("Failed to parse Waze's server response: " + req.responseText);
                        WMEAC.csvAddLog("Seg check KO: " + currentClosure.closure.location + " (" + currentClosure.closure.reason + "):\nFailed to parse response from Waze\n");
                        WMEAC.setCSVMiniLog(currentClosure, "segs KO: Failed to parse response from Waze", 3);
                    }
                }
                else
                {
                    WMEAC.log("Error on road tile: " + e.target.status);
                    WMEAC.csvAddLog("Seg check KO: " + currentClosure.closure.location + " (" + currentClosure.closure.reason + "):\nCommunication failed with Waze\n");
                    WMEAC.setCSVMiniLog(currentClosure, "segs KO: Communication failed with Waze", 3);
                }
                continueSegmentCheck();
            }
        };
        req.onError = function (e) {
            WMEAC.log("Error on road tile: " + e.target.status);
            WMEAC.csvAddLog("Seg check KO: " + currentClosure.closure.location + " (" + currentClosure.closure.reason + "):\nCommunication failed with Waze's server\n");
            WMEAC.setCSVMiniLog(currentClosure, "segs KO: Communication failed with Waze", 3);
            continueSegmentCheck();
        };
        /* // Useless since waze server never send content length... :/
        req.onprogress = function(e) {
            WMEAC.pb.update((i+(e.position / e.totalSize))*100/WMEAC.csvCurrentClosureList.length);
        };*/
        req.send(null);
    }
    else // end of check
    {
        WMEAC.pb.show(false);
    }

};

WMEAC.setCSVMiniLog = function(closure, text, level) // level=0: black 1: green, 2:orange, 3: red
{
    var c=null;
    if (closure.hasOwnProperty('UI'))
        c=closure;
    else
        c = WMEAC.csvCurrentClosureList.find(function (e) {
            return (e.closure.id == closure.id);
        });

    if (c!=null)
    {
        c.UI.children[7].innerHTML=text;
        var colors = ["#000000", "#54C600", "#FFA000", "#FF0000"];
        if (arguments.length==3)
            c.UI.children[7].style.color=colors[level];
        else
            c.UI.children[7].style.color=colors[0];
    }
};

WMEAC.CSVCheckAll = function (check)
{
    WMEAC.csvCurrentClosureList.forEach(function (e) {
        e.UI.children[0].children[0].checked = check;
    });
};

WMEAC.CSVApplyChecked = function ()
{
    WMEAC.csvCurrentBatchClosureList = WMEAC.csvCurrentClosureList.filter(function (e) {
        return (e.UI.children[0].children[0].checked);
    });
    WMEAC.csvClearLog();
    if (WMEAC.csvCurrentBatchClosureList.isEmpty())
    {
        WMEAC.csvAddLog("No closure checked!\n");
    }
    else
    {
        WMEAC.pb.update(0);
        WMEAC.pb.info("Applying closures. please wait...");
        WMEAC.pb.show(true);
        
        WMEAC.csvAddLog("Start to apply selected closures\n");
        window.setTimeout(function () { WMEAC.CSVBatchApply(0); });
    }
};

WMEAC.CSVBatchApply = function(i)
{
    WMEAC.pb.update(i*100/WMEAC.csvCurrentBatchClosureList.length);

    if (i<WMEAC.csvCurrentBatchClosureList.length)
    {
        if (WMEAC.csvCurrentBatchClosureList[i].action!='add')
        {
            WMEAC.csvAddLog("Closure KO: " + WMEAC.csvCurrentBatchClosureList[i].closure.location + " (" + WMEAC.csvCurrentBatchClosureList[i].closure.reason + "): action " + WMEAC.csvCurrentBatchClosureList[i].action + " not supported yet\n");
            WMEAC.setCSVMiniLog(WMEAC.csvCurrentBatchClosureList[i], "KO: action " + WMEAC.csvCurrentBatchClosureList[i].action + " not supported yet", 2);
            WMEAC.CSVBatchApply(i+1);
        }
        else
        {
            WMEAC.csvApplyClosure(WMEAC.csvCurrentBatchClosureList[i], function (success) {
                if (success)
                    WMEAC.csvAddLog("Closure OK: " + WMEAC.csvCurrentBatchClosureList[i].closure.location + " (" + WMEAC.csvCurrentBatchClosureList[i].closure.reason + ")\n");
                else
                    WMEAC.csvAddLog("Closure KO: " + WMEAC.csvCurrentBatchClosureList[i].closure.location + " (" + WMEAC.csvCurrentBatchClosureList[i].closure.reason + ")\n");
                WMEAC.CSVBatchApply(i+1);
            });
        }
    }
    else
    {
        WMEAC.csvAddLog("Apply selected closures ended\n");
        WMEAC.reloadClosuresLayer();
        WMEAC.pb.show(false);
    }
};

WMEAC.CSVCheckSegsChecked = function ()
{
    WMEAC.csvClearLog();
    WMEAC.csvCurrentBatchClosureList = WMEAC.csvCurrentClosureList.filter(function (e) {
        return (e.UI.children[0].children[0].checked);
    });
    if (WMEAC.csvCurrentBatchClosureList.isEmpty())
    {
        WMEAC.csvAddLog("No closure checked!\n");
    }
    else
    {
        WMEAC.csvCheckAllSegments(-1);
    }
};