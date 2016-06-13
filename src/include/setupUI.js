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
    
    var divAdvCl = WMEAC.createElement({type: 'div', className: 'wmeac-sidepanel', id:'wmeac-ac'});
    var addACBtn = WMEAC.createElement({type: 'div',
        id: 'wmeac-add-advanced-closure-button',
        className: 'wmeac-button'});
    addACBtn.style.width='100%';
    addACBtn.innerHTML='<i class="fa fa-clock-o"></i> Add advanced closure';
        
    addACBtn.addEventListener('click', WMEAC.showAddAdvancedClosure);
    divAdvCl.appendChild(addACBtn);
    
    var divCSV = WMEAC.createElement({type: 'div', className: 'wmeac-sidepanel', id:'wmeac-csv'});
    var csvHTML = '<label for="wmeac-csv-file" class="wmeac-button">Parse CSV</label>\
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
    
    addon.appendChild(divAdvCl);
    addon.appendChild(WMEAC.createElement({type: 'hr'}));
    addon.appendChild(divCSV);

    
    var userTabs = WMEAC.getId('user-tabs');
    var userInfo = WMEAC.getId('user-info');
    var sidePanelPrefs = WMEAC.getId('sidepanel-prefs');
    var navTabs = WMEAC.getElementsByClassName('nav-tabs', userTabs)[0];
    var tabContent = sidePanelPrefs.parentNode;
    
    newtab = WMEAC.createElement({type: 'li'});
    newtab.innerHTML = '<a title="Advanced closures" href="#sidepanel-wmeac" data-toggle="tab"><span class="fa fa-road slashed"></span></a>';
    navTabs.appendChild(newtab);

    
    addon.id = "sidepanel-wmeac";
    addon.className = "tab-pane";
    addon.style.marginLeft = "-10px";
    tabContent.appendChild(addon);

    //Waze.selectionManager.events.register("selectionchanged", null, WMEAC.selectionChanged);
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
        ACDiv.style.display="none";
        //Waze.selectionManager.events.register("selectionchanged", null, WMEAC.refreshClosureList);
    }
    if (ACDiv.style.display=="block") // already shown => reset position
    {
        $(ACDiv).css({left: '80px', top: '10px'});
    }
    else
    {
        ACDiv.style.display="block";
        Waze.selectionManager.events.register("selectionchanged", null, WMEAC.refreshClosureList);
    }
};

WMEAC.HTMLTemplates={};

var rangeStartEndUI ='\
  <div class="form-group">\
    <label class="control-label" for="closure_rangestartDate">Range start (included)</label>\
    <div class="controls">\
      <div  style="width: 58%" class="date date-input-group input-group pull-left">\
        <input id="wmeac-advanced-closure-dialog-rangestartdate" class="form-control start-date" type="text" name="closure_rangestartDate">\
        <span class="input-group-addon">\
          <i class="fa fa-calendar"></i>\
        </span>\
      </div>\
    </div>\
  </div>\
  <div class="form-group">\
    <label class="control-label" for="closure_rangeendDate">Range end (included)</label>\
    <div class="controls">\
      <div style="width: 58%" class="date date-input-group input-group pull-left">\
        <input id="wmeac-advanced-closure-dialog-rangeenddate" class="form-control end-date" type="text" name="closure_rangeendDate">\
        <span class="input-group-addon">\
          <i class="fa fa-calendar"></i>\
        </span>\
      </div>\
    </div>\
  </div>';

var startTimeAndDurationUI = '\
  <div class="form-group">\
    <label class="control-label" for="closure_startTime">Start and duration</label>\
    <div class="controls">\
      <div style="width: 50%;" class="bootstrap-timepicker input-group pull-left">\
        <input id="wmeac-advanced-closure-dialog-starttime" class="form-control start-time" type="text" name="closure_startTime">\
        <span class="input-group-addon">\
          <i class="fa fa-clock-o"></i>\
        </span>\
      </div>\
      <div style="width: 50%;" class="bootstrap-timepicker input-group">\
        <span class="input-group-addon">\
          <i class="fa fa-step-forward"></i>\
        </span>\
        <span class="form-control" style="padding: 1px; display: flex">\
          <input id="wmeac-advanced-closure-dialog-duration-hour" name="value" value=0 size=3/>\
          <span style="padding: 5px;">H</span>\
          <input id="wmeac-advanced-closure-dialog-duration-minute" name="value" value=0  size=2/>\
          <span style="padding: 5px;">M</span>\
        </span>\
      </div>\
    </div>\
  </div>\
';
  
var descriptionUI = '\
  <div class="form-group">\
      <label class="control-label" for="closure_reason">Description</label>\
      <div class="controls">\
        <input id="wmeac-advanced-closure-dialog-reason" class="form-control" type="text" name="closure_reason">\
      </div>\
    </div>\
';

var locationUI = '\
  <div class="form-group">\
    <label class="control-label" for="closure_location">Location</label>\
    <div class="controls">\
      <input id="wmeac-advanced-closure-dialog-location" class="form-control" type="text" name="closure_location">\
    </div>\
  </div>\
';

var directionUI = '\
  <div class="form-group">\
    <label class="control-label" for="closure_direction">Direction</label>\
    <div class="controls">\
      <select id="wmeac-advanced-closure-dialog-direction" style="font-family:\'FontAwesome\', Arial;" class="form-control" name="closure_direction">\
        <option value="1">One way (A &#8594; B)</option><option value="2">One way (B &#8594; A)</option><option value="3">Two way (&#xf0ec;)</option>\
      </select>\
    </div>\
  </div>\
';

var ignoreTrafficUI = '\
  <div class="checkbox">\
    <label class="control-label" style="font-weight: bold;">\
      <input id="wmeac-advanced-closure-dialog-ignoretraffic" type="checkbox" name="closure_permanent">\
      Ignore Traffic\
    </label>\
  </div>\
';

var overlapModeUI = '\
  <div class="form-group">\
    <label class="control-label" for="closure_overlap">Overlap action</label>\
    <div class="controls">\
      <select id="wmeac-advanced-closure-dialog-overlap" style="font-family:\'FontAwesome\', Arial;" class="form-control" name="closure_overlap">\
        <option value="0">Keep existing</option><option value="1">Delete existing</option><option value="2">Fill with new</option><option value="3">Force new</option>\
      </select>\
    </div>\
  </div>\
';


var tabRepeatUI = '\
  <div style="width: 150px;" class="input-group">\
    <div class="controls">\
      <div class="input-group pull-left">\
        <input id="wmeac-advanced-closure-dialog-repeat-ntimes" class="form-control" type="text" name="closure_repeat_ntimes">\
        <span class="input-group-addon" for="closure_repeat_ntimes">times</span>\
      </div>\
    </div>\
  </div>\
  <div style="width: 150px;" class="input-group">\
    <div class="controls">\
      <div style="width: 150px;" class="bootstrap-timepicker input-group">\
        <span class="input-group-addon">\
          every\
        </span>\
        <span class="form-control" style="padding: 1px; display: flex">\
          <input id="wmeac-advanced-closure-dialog-repeat-every-hour" name="value" value=0 size=3/>\
          <span style="padding: 5px;">H</span>\
          <input id="wmeac-advanced-closure-dialog-repeat-every-minute" name="value" value=0  size=2/>\
          <span style="padding: 5px;">M</span>\
        </span>\
      </div>\
    </div>\
  </div>\
';

var daysOfWeekUI = WMEAC.daysOfWeek.clone();
daysOfWeekUI.push(daysOfWeekUI.shift());
var tabEachUI = daysOfWeekUI.map(function (d, i) {
    return '<div class="checkbox">\
    <label class="control-label" style="font-weight: bold;">\
      <input id="wmeac-advanced-closure-dialog-each-' + ((i+1)%7) + '" type="checkbox" name="closure_each_' + d + '">\
      ' + d + '\
    </label>\
  </div>\
';
}).join('');
  
var tabPresetsUI = '\
<div class="content">\
  <table><tr><td style="width: 50%; border-right: 1px solid #F6C3BE; padding-right: 5px;">\
    <div class="form-group">\
      <label class="control-label" for="presets_load">Load preset</label>\
      <div class="controls">\
        <div class="input-group">\
          <select style="width: 100%;" id="wmeac-advanced-closure-dialog-presets-list" name="presets_load">\
          </select>\
          <span id="wmeac-advanced-closure-dialog-presets-load" class="input-group-addon">\
           <i class="fa fa-folder-open-o"></i>\
          </span>\
          <span id="wmeac-advanced-closure-dialog-presets-delete" class="input-group-addon">\
           <i class="fa fa-trash"></i>\
          </span>\
        </div>\
      </div>\
    </div>\
    </td><td style="padding-left: 5px;">\
    <div class="form-group">\
      <label class="control-label" for="presets_save">Save preset</label>\
      <div class="controls">\
        <div class="input-group pull-left">\
        <input id="wmeac-advanced-closure-dialog-presets-name" class="form-control" type="text" name="presets_save">\
        <span id="wmeac-advanced-closure-dialog-presets-save" class="input-group-addon">\
          <i class="fa fa-floppy-o"></i>\
        </span>\
        </div>\
      </div>\
    </div>\
    </td></tr></table>\
</div>\
';

var tabsUI ='\
  <ul class="nav wmeac-nav-tabs">\
    <li class="active">\
      <a id="wmeac-advanced-closure-dialog-repeat" data-toggle="tab" href="#wmeac-advanced-closure-dialog-tabrepeat">Repeat</a>\
    </li>\
    <li>\
      <a id="wmeac-advanced-closure-dialog-each" data-toggle="tab" href="#wmeac-advanced-closure-dialog-tabeach">Each</a>\
    </li>\
    <li style="float: right;">\
      <a id="wmeac-advanced-closure-dialog-presets" data-toggle="tab" href="#wmeac-advanced-closure-dialog-tabpresets"><i class="fa fa-floppy-o"></i></a>\
    </li>\
  </ul>\
  <div class="tab-content">\
    <div class="tab-pane active wmeac-tab-pane" id="wmeac-advanced-closure-dialog-tabrepeat">\
    ' + tabRepeatUI + '\
    </div>\
    <div class="tab-pane wmeac-tab-pane" id="wmeac-advanced-closure-dialog-tabeach">\
    ' + tabEachUI + '\
    </div>\
    <div class="tab-pane wmeac-tab-pane" id="wmeac-advanced-closure-dialog-tabpresets">\
    ' + tabPresetsUI + '\
    </div>\
  </div>';
  
var footerUI = '\
<div class="footer">\
    <div id="wmeac-csv-closures-preview"><div id="wmeac-csv-closures-preview-content" style="overflow-y: scroll; max-height: 150px;"></div></div>\
    <button style="float: right;" id="wmeac-advanced-closure-dialog-close-button">Close</button>\
    <button style="float: right;" id="wmeac-advanced-closure-dialog-apply-button">Apply</button>\
</div>';

WMEAC.HTMLTemplates.advancedClosureDialog='\
<h1>Advanced closures</h1>\
<div class="content">\
  <table>\
  <tr>\
    <td  style="width: 50%;">' +
      rangeStartEndUI + startTimeAndDurationUI +
    '\
    </td>\
    <td>' + 
      descriptionUI + directionUI + ignoreTrafficUI + // overlapModeUI +
    '\
    </td>\
  </tr>\
  </table>' + 
  tabsUI + 
'</div>' + footerUI;



WMEAC.connectAdvancedClosureDialogHandlers = function ()
{
    var e = null;
    e=WMEAC.getId('wmeac-advanced-closure-dialog-close-button');
    if (e)
    {
        e.addEventListener('click', function() {
            var d = WMEAC.getId('wmeac-add-advanced-closure-dialog');
            if (d) 
            {
                Waze.selectionManager.events.unregister("selectionchanged", null, WMEAC.refreshClosureList);
                d.style.display='none';
            }
        });
    }

    e=WMEAC.getId('wmeac-advanced-closure-dialog-apply-button');
    if (e)
    {
        e.addEventListener('click', function() {
            var rc = WMEAC.buildClosuresListFromRecurringUI();
            if (rc.error!="")
            {
                alert("Can't apply closures.\nPlease, check all parameters.");
                return;
            }
            if (Waze.selectionManager.selectedItems.isEmpty() || Waze.selectionManager.selectedItems[0].model.type!="segment")
            {
                alert("Please, select segment(s) before.");
                return;
            }
            if (Waze.selectionManager.selectedItems.every(function (e) {
                    return e.model.isAllowed(e.model.PERMISSIONS.EDIT_CLOSURES);
                })==false)
            {
                alert("You don't have permission to edit closures on all those segments.");
                return;
            }
            
            var reason = $('#wmeac-advanced-closure-dialog-reason').val();
            //var cllocation = $('#wmeac-advanced-closure-dialog-location').val();
            var direction = $('#wmeac-advanced-closure-dialog-direction').val();
            var sc = require("Waze/Modules/Closures/Models/SharedClosure");
            direction=(direction=="1"?sc.DIRECTION.A_TO_B:(direction=="2"?sc.DIRECTION.B_TO_A:sc.DIRECTION.TWO_WAY));
            var directionStr = direction==1?"(A &#8594; B)":(direction==2?"(B &#8594; A)":"(&#8646;)");
            var isIT = $('#wmeac-advanced-closure-dialog-ignoretraffic').is(':checked');
            closureList = rc.list.map(function (e) {
                //return {reason: reason, direction: direction, startDate: e.start, endDate: e.end, location: cllocation, permanent: isIT};
                return {reason: reason, direction: direction, startDate: e.start, endDate: e.end, location: "", permanent: isIT};
            });
            
            // save selection list
            var selection = _.pluck(Waze.selectionManager.selectedItems, 'model');
            Waze.selectionManager.events.unregister("selectionchanged", null, WMEAC.refreshClosureList);
            WMEAC.addClosureListFromSelection(closureList, function (i, e) {
                $('#wmeac-advanced-closure-dialog-preview-' + i).html(e).css({color: "#44D544"});
            }, function (i, e) {
                $('#wmeac-advanced-closure-dialog-preview-' + i).html(e).css({color: "#D5444F"});
            }, function () {
                Waze.selectionManager.select(selection);
                //alert ('done');
                var tmp = function selectionReady()
                {
                    if (Waze.selectionManager.selectedItems.isEmpty())
                        window.setTimeout(selectionReady, 500);
                    else
                        Waze.selectionManager.events.register("selectionchanged", null, WMEAC.refreshClosureList);
                };
                window.setTimeout(tmp, 500);
            }, 0);
        });
    }
    
    $("#wmeac-advanced-closure-dialog-rangestartdate,#wmeac-advanced-closure-dialog-rangeenddate").datepicker({ format: "yyyy-mm-dd", todayHighlight: !0, autoclose: !0});
    $("#wmeac-advanced-closure-dialog-starttime").timepicker({ defaultTime: "00:00", showMeridian: !1, template: !1});
    $("#wmeac-add-advanced-closure-dialog").find(".input-group").find(".input-group-addon").on("click", function (e) {
        $(e.target).parent().find("input").focus();
    }).find("i").on("click", function (e) {
        $(e.target).parent().parent().find("input").focus();
    });
    
    if (typeof $.fn.spinner !== 'undefined')
    {
        $('#wmeac-advanced-closure-dialog-repeat-every-hour').spinner({
            min: 0,
            spin: function (event, ui) {
                $(this).trigger('change');
            }
        });
        $('#wmeac-advanced-closure-dialog-repeat-every-minute').spinner({
        spin: function (event, ui) {
                 if (ui.value >= 60) {
                     $(this).spinner('value', ui.value - 60);
                     $('#wmeac-advanced-closure-dialog-repeat-every-hour').spinner('stepUp');
                     return false;
                 } else if (ui.value < 0) {
                     $(this).spinner('value', ui.value + 60);
                     $('#wmeac-advanced-closure-dialog-repeat-every-hour').spinner('stepDown');
                     return false;
                 }
                 $(this).trigger('change');
             },
             change: function (event) {
                if (event.target.value<0 || event.target.value>59)
                    $(this).spinner('value', 0);
             }
         });
         
        $('#wmeac-advanced-closure-dialog-duration-hour').spinner({
            min: 0,
            spin: function (event, ui) {
                $(this).trigger('change');
            }
        });
        $('#wmeac-advanced-closure-dialog-duration-minute').spinner({
        spin: function (event, ui) {
                 if (ui.value >= 60) {
                     $(this).spinner('value', ui.value - 60);
                     $('#wmeac-advanced-closure-dialog-duration-hour').spinner('stepUp');
                     return false;
                 } else if (ui.value < 0) {
                     $(this).spinner('value', ui.value + 60);
                     $('#wmeac-advanced-closure-dialog-duration-hour').spinner('stepDown');
                     return false;
                 }
                 $(this).trigger('change');
             },
             change: function (event) {
                if (event.target.value<0 || event.target.value>59)
                    $(this).spinner('value', 0);
             }
         });
    }
     
     
     
     $('#wmeac-advanced-closure-dialog-repeat,#wmeac-advanced-closure-dialog-each').on('click', function(e){
        window.setTimeout(WMEAC.refreshClosureList);
     });
     
     $('#wmeac-add-advanced-closure-dialog').on('change', function(e){
        window.setTimeout(WMEAC.refreshClosureList);
     });
     
     WMEAC.reloadPresets();
     
     $('#wmeac-advanced-closure-dialog-presets-load').on('click', function(e){
        var presetIndex = parseInt($("#wmeac-advanced-closure-dialog-presets-list").val());
        $("#wmeac-advanced-closure-dialog-starttime").val(WMEAC.presets[presetIndex].values.starttime);
        $("#wmeac-advanced-closure-dialog-duration-hour").val(WMEAC.presets[presetIndex].values.duration.hour);
        $("#wmeac-advanced-closure-dialog-duration-minute").val(WMEAC.presets[presetIndex].values.duration.minute);
        $("#wmeac-advanced-closure-dialog-reason").val(WMEAC.presets[presetIndex].values.description);
        //$("#wmeac-advanced-closure-dialog-location").val(WMEAC.presets[presetIndex].values.location);
        $("#wmeac-advanced-closure-dialog-direction").val(WMEAC.presets[presetIndex].values.direction);
        $("#wmeac-advanced-closure-dialog-ignoretraffic").prop('checked', WMEAC.presets[presetIndex].values.ignoretraffic);
        $("#wmeac-advanced-closure-dialog-repeat-ntimes").val(WMEAC.presets[presetIndex].values.repeat.ntimes);
        $("#wmeac-advanced-closure-dialog-repeat-every-hour").val(WMEAC.presets[presetIndex].values.repeat.hour);
        $("#wmeac-advanced-closure-dialog-repeat-every-minute").val(WMEAC.presets[presetIndex].values.repeat.minute);
        for (var i=0; i<7; i++)
            $("#wmeac-advanced-closure-dialog-each-"+i).prop('checked', WMEAC.presets[presetIndex].values.each[i]);
     });

     $('#wmeac-advanced-closure-dialog-presets-delete').on('click', function(e){
        var presetIndex = parseInt($("#wmeac-advanced-closure-dialog-presets-list").val());
        WMEAC.presets.splice(presetIndex, 1);
        WMEAC.save();
        WMEAC.reloadPresets();
     });

     
     $('#wmeac-advanced-closure-dialog-presets-save').on('click', function(e){
        var name = $("#wmeac-advanced-closure-dialog-presets-name").val();
        var presetIndex = WMEAC.presets.findIndex(function (e) {
            return e.name==name;
        });
        var preset = {name: name, values: { duration: {}, repeat: {}, each: []}};
        if (presetIndex!=-1) // overwrite existing preset
            preset=WMEAC.presets[presetIndex];
        
        preset.values.starttime=$("#wmeac-advanced-closure-dialog-starttime").val();
        preset.values.duration.hour=$("#wmeac-advanced-closure-dialog-duration-hour").val();
        preset.values.duration.minute=$("#wmeac-advanced-closure-dialog-duration-minute").val();
        preset.values.description=$("#wmeac-advanced-closure-dialog-reason").val();
        //preset.values.location=$("#wmeac-advanced-closure-dialog-location").val();
        preset.values.direction=$("#wmeac-advanced-closure-dialog-direction").val();
        preset.values.ignoretraffic=$("#wmeac-advanced-closure-dialog-ignoretraffic").is(':checked');
        preset.values.repeat.ntimes=$("#wmeac-advanced-closure-dialog-repeat-ntimes").val();
        preset.values.repeat.hour=$("#wmeac-advanced-closure-dialog-repeat-every-hour").val();
        preset.values.repeat.minute=$("#wmeac-advanced-closure-dialog-repeat-every-minute").val();
        for (var i=0; i<7; i++)
            preset.values.each[i]=$("#wmeac-advanced-closure-dialog-each-"+i).is(':checked');
        if (presetIndex==-1)
            WMEAC.presets.push(preset);
        WMEAC.save();
        WMEAC.reloadPresets();
     });
     
     WMEAC.setDraggable($('#wmeac-add-advanced-closure-dialog'), { controller: $('#wmeac-add-advanced-closure-dialog h1:first-child'), container: $('#WazeMap') });
     
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

WMEAC.reloadPresets = function ()
{
    var optionList=WMEAC.presets.map(function (p, i) {
        return '<option value="' + i + '">' + p.name + '</option>';
    });
    $("#wmeac-advanced-closure-dialog-presets-list").html(optionList.join(''));
};