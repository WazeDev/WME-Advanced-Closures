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
                return {action: e[0], closure: new WMEAC.ClassClosure({reason:e[1], location:e[2], startDate:e[3], endDate:e[4], direction:e[5], segIDs:e[6], lonlat:e[7], permanent:e[8], id: i})};
            });
            WMEAC.log("Closure list:", closures);
            WMEAC.csvCurrentClosureList = closures;
            var listUI = WMEAC.getId('wmeac-csv-closures-list-elts');
            // remove all closures before:
            WMEAC.removeChildElements(listUI);
            closures.forEach(function (c) {
                var ui = WMEAC.buildInlineClosureUI(c.closure, c.action);
                listUI.appendChild(ui);
            });
            WMEAC.csvShowList(true);
            WMEAC.csvClearLog();
            WMEAC.csvAddLog("CSV parse successful\n");
            // aply closures: TEST ONLY: this should not be done there!
            /*closures.forEach(function (c) {
                c.closure.applyInWME(function () { WMEAC.log("Closure success:", c);});
            });*/
            // END OF aply closures: TEST ONLY: this should not be done there!
        }
        else
        {
            WMEAC.log("CSV is NOT valid!:" + isValid.feedBack);
            WMEAC.csvAddLog(isValid.feedBack);
            WMEAC.csvShowList(false);
            WMEAC.csvCurrentClosureList = null;
        }
    }
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
                                WMEAC.parseCSV(e.target.result);
						};
				})(f);

				// Read in the image file as a data URL.
				reader.readAsText(f);
		}
        this.value = null;
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
            return (line.length>=1 && line[0]!="header" && line[0]!="comment");
        });
    };
};

WMEAC.csv.push(new WMEAC.ClassCSV({version: 1, regexpValidation: [/(^header$)|(^comment$)|(^add$)/, // 1st cell
                                                                  /.*/, // reason is free
                                                                  /.*/, // location is free
                                                                  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, // start date
                                                                  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, // end date
                                                                  /(^A to B$)|(^B to A$)|(^TWO WAY$)/, // direction
                                                                  /^(\d+(;|$))+/, // seg ID list
                                                                  /(lon=(-?\d+\.?\d*)&lat=(-?\d+\.?\d*))|(lat=(-?\d+\.?\d*)&lon=(-?\d+\.?\d*))/, // lonlat
                                                                  /(Yes)|(No)/ // ignore trafic = permanent
                                                                  ]}));
                                                                  
WMEAC.buildInlineClosureUI = function (closure, action)
{
    var liElt = WMEAC.createElement({type: 'li', className: 'wmeac-csv-closures-list-' + action});
    liElt.setAttribute('closureID', closure.id);
    liElt.innerHTML='<div class="wmeac-csv-closures-list-col-action"><input type="checkbox" /></div>\
                    <div class="wmeac-csv-closures-list-col-lr"><div title="' + closure.location + '">' + closure.location + '</div><div title="' + closure.reason + '">' + closure.reason + '</div></div>\
                    <div class="wmeac-csv-closures-list-col-dates">' + closure.startDate + '<br/>' + closure.endDate + '</div>\
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
        Waze.map.setCenter(xy, 4);
        var tmp2 = function selectSegments()
        {
            WMEAC.log("Now select segments...");
            var segs = WMEAC.segmentsIDsToSegments(closure.closure.segIDs);
            if (segs.length!=closure.closure.segIDs.length)
            {
                if (segs.length==0)
                {
                    WMEAC.csvAddLog("No segment found: " + closure.closure.location + "(" + closure.closure.reason + ")\n");
                    liElt.children[7].innerHTML="Selection failed: no segment found";
                }
                else
                {
                    WMEAC.csvAddLog("Partial selection (" + segs.length + "/" + closure.closure.segIDs.length + "): " + closure.closure.location + "(" + closure.closure.reason + ")\n");
                    liElt.children[7].innerHTML="Partial selection: " + segs.length + "/" + closure.closure.segIDs.length;                    
                }
                alert ("Warning: missing segments.\nFound " + segs.length + "/" + closure.closure.segIDs.length + " segment(s)");
            }
            else
            {
                WMEAC.csvAddLog("Selection ok (" + segs.length + "): " + closure.closure.location + "(" + closure.closure.reason + ")\n");
                liElt.children[7].innerHTML="Selection OK: " + segs.length;
            }
            if (segs.length!=0)
                Waze.selectionManager.select(segs);
        };
        var tmp1 = function readyToSelect() {
            WMEAC.log("Test to select segments...");
            if (WMEAC.pendingOps==true)
            {
                WMEAC.log("Not yet. Waiting for WME...");
                window.setTimeout(readyToSelect, 500);
            }
            else
                tmp2();
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
        var xy = OpenLayers.Layer.SphericalMercator.forwardMercator(closure.closure.lonlat.lon, closure.closure.lonlat.lat);
        Waze.map.setCenter(xy, 4);
        function applySuccess(evt)
        {
            WMEAC.csvAddLog("Closure OK: " + closure.closure.location + "(" + closure.closure.reason + ")\n");
            liElt.className="wmeac-csv-closures-list-done";
            liElt.children[7].innerHTML="OK";
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
            liElt.children[7].innerHTML="KO: " + details;
            liElt.className="wmeac-csv-closures-list-failed";
        };
        var tmp2 = function applyClosure()
        {
            WMEAC.log("Now apply closure...");
            closure.closure.applyInWME(applySuccess, applyFailure);
        };
        var tmp1 = function readyToApply() {
            WMEAC.log("Test to apply closure...");
            if (WMEAC.pendingOps==true)
            {
                WMEAC.log("Not yet. Waiting for WME...");
                window.setTimeout(readyToApply, 500);
            }
            else
                tmp2();
        };
        window.setTimeout(tmp1, 500);
    });
    return liElt;
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