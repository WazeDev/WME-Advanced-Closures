WMEAC.initUI = function ()
{
		var addon = WMEAC.createElement({type: 'section', id: 'wmeac-addon'});
		
        WMEAC.pb = new WMEAC.ProgressBar('wmeac-progressBarInfo');
		
		addon.appendChild(WMEAC.pb.divpbi);
		
		
		var section = WMEAC.createElement({type: 'p', id: 'wmeac-main-title'});
		section.style.paddingTop = "0px";
		section.style.marginTop = "-15px";
		section.style.textIndent = "8px";
		
		var title='<b><a target="_blank" href="https://greasyfork.org/fr/scripts/"><u>Advanced Closures</u></a> <a target="_blank" href="https://www.waze.com/forum/viewtopic.php?f=68&t=91786">Fr</a> <a target="_blank" href="https://www.waze.com/forum/viewtopic.php?f=819&t=125216">En</a> </b> v' + WMEAC.ac_version;
		section.innerHTML  = title;
		addon.appendChild(section);
        
        var divCSV = WMEAC.createElement({type: 'div', className: 'wmeac-sidepanel', id:'wmeac-csv'});
        var csvHTML = '<label for="wmeac-csv-file" class="wmeac-csv-custom-file-upload">Parse CSV</label>\
        <input id="wmeac-csv-file" type="file" name="files[]" style="display: none;" />';
        csvHTML += '\
        <div id="wmeac-csv-closures" style="display: none;">\
            <div id="wmeac-csv-closures-controls">\
                <input type="checkbox" id="wmeac-csv-closures-controls-check"> | \
                <a href="#" id="wmeac-csv-closures-controls-apply">Apply</a> | \
                <a href="#" id="wmeac-csv-closures-controls-segs">Check segments</a>\
            </div>\
            <div id="wmeac-csv-closures-list">\
                <ul id="wmeac-csv-closures-list-elts">\
                </ul>\
            </div>\
        </div>\
        <div id="wmeac-csv-closures-log">\
        </div>';
        
        divCSV.innerHTML = csvHTML;
        addon.appendChild(divCSV);

		
		var userTabs = WMEAC.getId('user-tabs');
		var userInfo = WMEAC.getId('user-info');
		var sidePanelPrefs = WMEAC.getId('sidepanel-prefs');
		var navTabs = WMEAC.getElementsByClassName('nav-tabs', userTabs)[0];
		var tabContent = sidePanelPrefs.parentNode;
		
		newtab = WMEAC.createElement({type: 'li'});
		newtab.innerHTML = '<a title="Advanced closures" href="#sidepanel-wmeac" data-toggle="tab"><span class="fa fa-road"></span></a>';
		navTabs.appendChild(newtab);

		
		addon.id = "sidepanel-wmeac";
		addon.className = "tab-pane";
		addon.style.marginLeft = "-10px";
		tabContent.appendChild(addon);

		Waze.selectionManager.events.register("selectionchanged", null, WMEAC.selectionChanged);
        Waze.vent.on("operationPending", function(e) {
            if (e.operation.id!="pending.road_data")
                return;
            WMEAC.pendingOps = true;
        });

        Waze.vent.on("operationDone", function(e) {
            if (e.operation.id!="pending.road_data")
                return;
            WMEAC.pendingOps = false;
        });

        window.setTimeout(WMEAC.connectAdvancedClosureTabHandlers);
};

WMEAC.selectionChanged = function (e)
{
	if (WMEAC.closureTabTimeout!=null)
	{
		// unset the timeout
		window.clearTimeout(WMEAC.closureTabTimeout);
		WMEAC.closureTabTimeout=null;
	}

	var roadClosuresLayer = Waze.map.getLayersByName("Road Closures");
	WMEAC.log("rcl;", roadClosuresLayer);
	if (roadClosuresLayer.length==1)
		roadClosuresLayer=roadClosuresLayer[0];
	else
		return;
	WMEAC.log("sel;", e);
	if (e.selected.length!=0 && e.selected[0].model.type=="segment")
	{
		// now setup timeout to wait for active closures tab
		var tmp = function tmpFunc() {
			var tabEditClosures = WMEAC.getId('segment-edit-closures');
			//WMEAC.log("tabEditClosures:", tabEditClosures);
			//if (tabEditClosures) WMEAC.log("classname", tabEditClosures.className);
			if (tabEditClosures!=null && tabEditClosures.className.indexOf('active')!=-1 && roadClosuresLayer.visibility==true)
			{
				//WMEAC.log("Here we go in closure tab!", tabEditClosures);
				WMEAC.initInClosureTab({divTab: tabEditClosures});
				return;
			}
			else
			{
				WMEAC.closureTabTimeout=window.setTimeout(tmpFunc, 100);
				//WMEAC.log("waiting for closure tab...");
			}
		};
		WMEAC.closureTabTimeout=window.setTimeout(tmp);
	}
};


WMEAC.initInClosureTab = function (data)
{
	var addACBtn = WMEAC.getId('wmeac-add-advanced-closure-button');
	if (addACBtn!=null && WMEAC.isDescendant(data.divTab, addACBtn))
		return; // our button is already there
	if (addACBtn!=null)
	{
		// oops, our button exists but in the wrong place? Delete it
		addACBtn.parentNode.removeChild(addACBtn);
	}
	
	var addBtn = WMEAC.getElementsByClassName('add-closure-button', data.divTab);
	if (addBtn.length!=1)
		return;
	addBtn = addBtn[0];
	
	var btnsContainer = addBtn.parentNode;
	addACBtn = WMEAC.createElement({type: 'div',
																	id: 'wmeac-add-advanced-closure-button',
																	className: 'btn btn-primary'});
	addACBtn.style.width='100%';
	addACBtn.style.marginBottom= '10px';
	addACBtn.innerHTML='<i class="fa fa-clock-o"> Add advanced closure</i>';
	
	addACBtn.addEventListener('click', WMEAC.showAddAdvancedClosure);
	
	if (addBtn.nextSibling) {
		btnsContainer.insertBefore(addACBtn, addBtn.nextSibling);
	}
	else {
		btnsContainer.appendChild(addACBtn);
	}
};

WMEAC.showAddAdvancedClosure = function()
{
	// init if needed and show modal dialog
	var ACDiv = WMEAC.getId('wmeac-add-advanced-closure-dialog');
	if (ACDiv==null)
	{
		ACDiv = WMEAC.createElement({type: 'div',
																 id: 'wmeac-add-advanced-closure-dialog',
																 className: 'wmeac-closuredialog'});
		ACDiv.innerHTML=WMEAC.HTMLTemplates.advancedClosureDialog;
		Waze.map.div.appendChild(ACDiv);
		window.setTimeout(WMEAC.connectAdvancedClosureDialogHandlers);
	}
	ACDiv.style.display="block";
};

WMEAC.HTMLTemplates={};
// button id="wmeac-advanced-closure-dialog-test-button" TEST ONLY - TO BE REMOVED
WMEAC.HTMLTemplates.advancedClosureDialog='\
<h1>Advanced closures</h1>\
<div class="content">\
<button id="wmeac-advanced-closure-dialog-test-button">TEST</button>\
</div>\
<div class="footer">\
	<button style="float: right;" id="wmeac-advanced-closure-dialog-close-button">Close</button>\
</div>\
';

WMEAC.connectAdvancedClosureDialogHandlers = function ()
{
	var e = null;
	e=WMEAC.getId('wmeac-advanced-closure-dialog-close-button');
	if (e)
	{
		e.addEventListener('click', function() {
			var d = WMEAC.getId('wmeac-add-advanced-closure-dialog');
			if (d) d.style.display='none';
		});
	}

    // TEST ONLY - TO BE REMOVED
    e=WMEAC.getId('wmeac-advanced-closure-dialog-test-button');
	if (e)
	{
		e.addEventListener('click', function() {
            var sc = require("Waze/Modules/Closures/Models/SharedClosure");
            WMEAC.addClosureFromSelection({reason: "Test dummyd2", direction: sc.DIRECTION.A_TO_B, startDate: "2016-05-27 00:00", endDate: "2016-05-28 00:00", location: "Somewhere", permanent: true});
		});
	}
    // TEST ONLY - TO BE REMOVED
    
};


WMEAC.connectAdvancedClosureTabHandlers = function ()
{
	var e = null;
    
	e=WMEAC.getId('wmeac-csv-file');
	if (e)
		e.addEventListener('change', WMEAC.CSVFileChanged);
    
    e=WMEAC.getId('wmeac-csv-closures-controls-check');
	if (e)
		e.addEventListener('change', function (e) { WMEAC.CSVCheckAll(e.target.checked); });
    
    e=WMEAC.getId('wmeac-csv-closures-controls-apply');
	if (e)
		e.addEventListener('click', WMEAC.CSVApplyChecked);

    e=WMEAC.getId('wmeac-csv-closures-controls-segs');
	if (e)
		e.addEventListener('click', WMEAC.CSVCheckSegsChecked);

    
};