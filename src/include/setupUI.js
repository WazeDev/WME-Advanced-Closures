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
    }
    ACDiv.style.display="block";
};

WMEAC.HTMLTemplates={};

var rangeStartEnd ='\
  <div class="form-group">\
    <label class="control-label" for="closure_rangestartDate">Range start</label>\
    <div class="controls">\
      <div  style="width: 58%" class="date date-input-group input-group pull-left">\
        <input id="wmeac-advanced-closure-dialog-rangestartdate" class="form-control start-date" type="text" name="closure_rangestartDate">\
        <span class="input-group-addon">\
          <i class="fa fa-calendar"></i>\
        </span>\
      </div>\
      <div class="bootstrap-timepicker input-group">\
        <input id="wmeac-advanced-closure-dialog-rangestarttime" class="form-control start-time" type="text" name="closure_rangestartTime">\
        <span class="input-group-addon">\
          <i class="fa fa-clock-o"></i>\
        </span>\
      </div>\
    </div>\
  </div>\
  <div class="form-group">\
    <label class="control-label" for="closure_rangeendDate">Range end</label>\
    <div class="controls">\
      <div style="width: 58%" class="date date-input-group input-group pull-left">\
        <input id="wmeac-advanced-closure-dialog-rangeenddate" class="form-control end-date" type="text" name="closure_rangeendDate">\
        <span class="input-group-addon">\
          <i class="fa fa-calendar"></i>\
        </span>\
      </div>\
      <div class="bootstrap-timepicker input-group">\
        <input id="wmeac-advanced-closure-dialog-rangeendtime" class="form-control end-time" type="text" name="closure_rangeendTime">\
        <span class="input-group-addon">\
          <i class="fa fa-clock-o"></i>\
        </span>\
      </div>\
    </div>\
  </div>';

var startTimeAndDuration = '\
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
  
var description = '\
  <div class="form-group">\
      <label class="control-label" for="closure_reason">Description</label>\
      <div class="controls">\
        <input id="wmeac-advanced-closure-dialog-reason" class="form-control" type="text" name="closure_reason">\
      </div>\
    </div>\
';

var location = '\
  <div class="form-group">\
    <label class="control-label" for="closure_location">Location</label>\
    <div class="controls">\
      <input id="wmeac-advanced-closure-dialog-location" class="form-control" type="text" name="closure_location">\
    </div>\
  </div>\
';

var direction = '\
  <div class="form-group">\
    <label class="control-label" for="closure_direction">Direction</label>\
    <div class="controls">\
      <select id="wmeac-advanced-closure-dialog-direction" style="font-family:\'FontAwesome\', Arial;" class="form-control" name="closure_direction">\
        <option value="1">One way (A &#8594; B)</option><option value="2">One way (B &#8594; A)</option><option value="3">Two way (&#xf0ec;)</option>\
      </select>\
    </div>\
  </div>\
';

var ignoreTraffic = '\
  <div class="checkbox">\
    <label class="control-label" style="font-weight: bold;">\
      <input id="wmeac-advanced-closure-dialog-ignoretraffic" type="checkbox" name="closure_permanent">\
      Ignore Traffic\
    </label>\
  </div>\
';

var tabRepeat = '\
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

var daysOfWeek = WMEAC.daysOfWeek.clone();
daysOfWeek.push(daysOfWeek.shift());
var tabEach = daysOfWeek.map(function (d, i) {
    return '<div class="checkbox">\
    <label class="control-label" style="font-weight: bold;">\
      <input id="wmeac-advanced-closure-dialog-each-' + ((i+1)%7) + '" type="checkbox" name="closure_each_' + d + '">\
      ' + d + '\
    </label>\
  </div>\
';
}).join('');
  

var tabs ='\
  <ul class="nav wmeac-nav-tabs">\
    <li class="active">\
      <a id="wmeac-advanced-closure-dialog-repeat" data-toggle="tab" href="#wmeac-advanced-closure-dialog-tabrepeat">Repeat</a>\
    </li>\
    <li>\
      <a id="wmeac-advanced-closure-dialog-each" data-toggle="tab" href="#wmeac-advanced-closure-dialog-tabeach">Each</a>\
    </li>\
  </ul>\
  <div class="tab-content">\
    <div class="tab-pane active wmeac-tab-pane" id="wmeac-advanced-closure-dialog-tabrepeat">\
    ' + tabRepeat + '\
    </div>\
    <div class="tab-pane wmeac-tab-pane" id="wmeac-advanced-closure-dialog-tabeach">\
    ' + tabEach + '\
    </div>\
  </div>';
  
var footer = '\
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
      rangeStartEnd + startTimeAndDuration +
    '\
    </td>\
    <td>' + 
      description + location + direction + ignoreTraffic +
    '\
    </td>\
  </tr>\
  </table>' + 
  tabs + 
'</div>' + footer;



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
            if (Waze.selectionManager.selectedItems.every(e => e.model.isAllowed(e.model.PERMISSIONS.EDIT_CLOSURES))==false)
            {
                alert("You don't have permission to edit closures on all those segments.");
                return;
            }
            
            var reason = $('#wmeac-advanced-closure-dialog-reason').val();
            var location = $('#wmeac-advanced-closure-dialog-location').val();
            var direction = $('#wmeac-advanced-closure-dialog-direction').val();
            var sc = require("Waze/Modules/Closures/Models/SharedClosure");
            direction=(direction=="1"?sc.DIRECTION.A_TO_B:(direction=="2"?sc.DIRECTION.B_TO_A:sc.DIRECTION.TWO_WAY));
            var directionStr = direction==1?"(A &#8594; B)":(direction==2?"(B &#8594; A)":"(&#8646;)");
            var isIT = $('#wmeac-advanced-closure-dialog-ignoretraffic').is(':checked');
            closureList = rc.list.map(function (e) {
                return {reason: reason, direction: direction, startDate: e.start, endDate: e.end, location: location, permanent: isIT};
            });
            
            WMEAC.addClosureListFromSelection(closureList, function (i, e) {
                $('#wmeac-advanced-closure-dialog-preview-' + i).html(e).css({color: "#44D544"});
            }, function (i, e) {
                $('#wmeac-advanced-closure-dialog-preview-' + i).html(e).css({color: "#D5444F"});
            }, function () {
                alert ('done');
            }, 0);
        });
    }
    
    $("#wmeac-advanced-closure-dialog-rangestartdate,#wmeac-advanced-closure-dialog-rangeenddate").datepicker({ format: "yyyy-mm-dd", todayHighlight: !0, autoclose: !0});
    $("#wmeac-advanced-closure-dialog-rangestarttime,#wmeac-advanced-closure-dialog-rangeendtime,#wmeac-advanced-closure-dialog-starttime").timepicker({ defaultTime: "00:00", showMeridian: !1, template: !1});
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
     
     function refreshClosureList()
     {
        var rc = WMEAC.buildClosuresListFromRecurringUI();
        if (rc.error!="")
            $('#wmeac-csv-closures-preview-content').html(rc.error);
        else
        {
            var reason = $('#wmeac-advanced-closure-dialog-reason').val();
            var location = $('#wmeac-advanced-closure-dialog-location').val();
            var direction = $('#wmeac-advanced-closure-dialog-direction').val();
            var directionStr = direction==1?"(A &#8594; B)":(direction==2?"(B &#8594; A)":"(&#8646;)");
            var isIT = $('#wmeac-advanced-closure-dialog-ignoretraffic').is(':checked');
            $('#wmeac-csv-closures-preview-content').html('' + rc.list.length + ' closure(s) to apply: <br>' +
                rc.list.map(function (e, i) {
                return (reason +
                ' (' + location + '): ' + 
                e.start + ' &#8594; ' + e.end + 
                ' ' + directionStr + 
                ' <i class="fa fa-car' + (isIT?" slashed":"") + '"></i>' +
                ' <span id="wmeac-advanced-closure-dialog-preview-' + i + '"></span>');
            }).join('<br>'));
        }     
     }
     
     $('#wmeac-advanced-closure-dialog-repeat,#wmeac-advanced-closure-dialog-each').on('click', function(e){
        window.setTimeout(refreshClosureList);
     });
     
     $('#wmeac-add-advanced-closure-dialog').on('change', function(e){
        window.setTimeout(refreshClosureList);
     });
     
     WMEAC.setDraggable($('#wmeac-add-advanced-closure-dialog'), $('#wmeac-add-advanced-closure-dialog h1:first-child'));
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