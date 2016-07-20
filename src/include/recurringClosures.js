WMEAC.buildClosuresListFromRecurringUI = function ()
{
    var list = [];
    var rangeStartDate = new Date($('#wmeac-advanced-closure-dialog-rangestartdate').val());
    if (!WMEAC.isValidDate(rangeStartDate)) return {list: list, error: "Range start date is not valid"};
    
    var rangeEndDate = new Date($('#wmeac-advanced-closure-dialog-rangeenddate').val());
    if (!WMEAC.isValidDate(rangeEndDate)) return {list: list, error: "Range end date is not valid"};
    
    if (rangeEndDate<rangeStartDate) return {list: list, error: "Range end date is before range start date"};
    
    var dH = parseInt($('#wmeac-advanced-closure-dialog-duration-hour').val());
    if (isNaN(dH) || dH<0) return {list: list, error: "Duration hour is invalid"};
    
    var dM = parseInt($('#wmeac-advanced-closure-dialog-duration-minute').val());
    if (isNaN(dM) || dM<0 || dM>=60) return {list: list, error: "Duration minute is invalid"};
    
    if (dH==0 && dM==0) return {list: list, error: "Duration is null"};
    
    // var rangeStartTimeM = $('#wmeac-advanced-closure-dialog-rangestarttime').val().split(':').map(function (e) {
        // return parseInt(e);
    // }).reduce(function (p, c, i) {
        // return (p*60+c);
    // });
    var rangeStartTimeM = 0;
    
    // var rangeEndTimeM = $('#wmeac-advanced-closure-dialog-rangeendtime').val().split(':').map(function (e) {
        // return parseInt(e);
    // }).reduce(function (p, c, i) {
        // return (p*60+c);
    // });
    var rangeEndTimeM = 1440;
    
    var rangeEndDateTime = rangeEndDate.clone();
    rangeEndDateTime.addMinutes(rangeEndTimeM);
    
    var startTimeM = $('#wmeac-advanced-closure-dialog-starttime').val().split(':').map(function (e) {
        return parseInt(e);
    }).reduce(function (p, c, i) {
        return (p*60+c);
    });
    
    // if mode is REPEAT
    if ($('#wmeac-advanced-closure-dialog-tabrepeat').attr('class').indexOf('active')!=-1)
    {
        var ntimes = parseInt($('#wmeac-advanced-closure-dialog-repeat-ntimes').val());
        if (isNaN(ntimes) || ntimes<1) return {list: list, error: "Repeat count is invalid"};
        var evH = parseInt($('#wmeac-advanced-closure-dialog-repeat-every-hour').val());
        if (isNaN(evH) || evH<0) return {list: list, error: "Repeat every hour is invalid"};
        var evM = parseInt($('#wmeac-advanced-closure-dialog-repeat-every-minute').val());
        if (isNaN(evM) || evM<0 || evM>=60) return {list: list, error: "Repeat every minute is invalid"};
        
        // if repeat is smaller than duration
        if (evH * 60 + evM < dH * 60 + dM) return {list: list, error: "Repeat must be greater than duration"};
        
        var firstDateTimeStart = rangeStartDate.clone();
        if (startTimeM<rangeStartTimeM) // starts the day after
            firstDateTimeStart.addDays(1);
        firstDateTimeStart.setMinutes(startTimeM);
        
        var firstDateTimeEnd = firstDateTimeStart.clone();
        firstDateTimeEnd.addMinutes(dH * 60 + dM);
        
       
        var now = new Date();
        
        for (var i=0; i<ntimes; i++)
        {
            var start = firstDateTimeStart.clone();
            start.addMinutes((evH * 60 + evM)*i);
            var end = start.clone();
            end.addMinutes(dH * 60 + dM);
            if (end > rangeEndDateTime) // stop if after range end
                break;
            WMEAC.log('end', end);
            WMEAC.log('now', now);
            if (end < now) // do not add closure that ends before now
            {
                ntimes++;
                continue;
            }
            list.push({start: WMEAC.dateToClosureStr(start), end: WMEAC.dateToClosureStr(end)});
        }
        
        return {list: list, error: ""};
    }
    // if mode is EACH
    else if ($('#wmeac-advanced-closure-dialog-tabeach').attr('class').indexOf('active')!=-1)
    {
        // build bits for a week:
        var dow = WMEAC.daysOfWeek.map(function (e, i) {
            return ($('#wmeac-advanced-closure-dialog-each-' + i)).is(':checked');
        });
        var dayCount = Math.ceil((rangeEndDate-rangeStartDate+1)/86400000);
        
        var day0 = rangeStartDate.clone();
        day0.addMinutes(startTimeM);
        if (startTimeM<rangeStartTimeM) // starts the day after
            day0.addDays(1);
        
        for (var d=0; d<dayCount; d++)
        {
            var start = day0.clone();
            start.addMinutes(d*1440);
            if (dow[start.getUTCDay()])
            {
                var end = start.clone();
                end.addMinutes(dH * 60 + dM);
                if (end > rangeEndDateTime) // stop if after range end
                    break;
                list.push({start: WMEAC.dateToClosureStr(start), end: WMEAC.dateToClosureStr(end)});
            }
        }
        return {list: list, error: ""};
    }
    else if ($('#wmeac-advanced-closure-dialog-tabholiday').attr('class').indexOf('active')!=-1)
    {
        WMEAC.lastGeneratedHolidays.forEach(function (e, i) {
            if (($('#wmeac-advanced-closure-dialog-holidays-' + i)).is(':checked'))
            {
                var start = new Date(e.date).addMinutes(startTimeM);
                var end = start.clone();
                end.addMinutes(dH * 60 + dM);
                list.push({start: WMEAC.dateToClosureStr(start), end: WMEAC.dateToClosureStr(end)});
            }
        });
        return {list: list, error: ""};
    }
    else
        return {list: list, error: "Wrong tab active"};

};

WMEAC.refreshClosureList = function ()
{
    try {
        var rc = WMEAC.buildClosuresListFromRecurringUI();
        if (rc.error!="")
            $('#wmeac-csv-closures-preview-content').html(rc.error);
        else
        {
            var reason = $('#wmeac-advanced-closure-dialog-reason').val();
            //var cllocation = $('#wmeac-advanced-closure-dialog-location').val();
            var direction = $('#wmeac-advanced-closure-dialog-direction').val();
            var directionStr = direction==1?"(A &#8594; B)":(direction==2?"(B &#8594; A)":"(&#8646;)");
            var isIT = $('#wmeac-advanced-closure-dialog-ignoretraffic').is(':checked');
            var existingClosures = Waze.selectionManager.selectedItems.reduce(function (p, c, i) {
                var revSegs = Waze.selectionManager.getReversedSegments();
                var isReversed = revSegs.hasOwnProperty(c.model.attributes.id) && revSegs[c.model.attributes.id];
                var realWay = isReversed?(direction==1?2:1):direction;
                return p.concat(Waze.model.roadClosures.getObjectArray(function (e) {
                    return (e.segID==c.model.attributes.id &&
                    (direction==3 || (e.forward && realWay==1) || (!e.forward && realWay==2)));
                }));
            }, []);
            var mte = Waze.model.majorTrafficEvents.get($("#wmeac-advanced-closure-dialog-mteid").val());
            $('#wmeac-csv-closures-preview-content').html('' + rc.list.length + ' closure(s) to apply: <br>' +
                rc.list.map(function (e, i) {
                    var overlap = existingClosures.filter(function (c) {
                        return WMEAC.dateTimeOverlaps({startDate: e.start, endDate: e.end}, c);
                    }).map(function (c) {
                        var msg = (c.reason?c.reason + ' ':'') + '(' + c.segID + ')';
                        if (Waze.model.segments.objects.hasOwnProperty(c.segID)==false) return msg;
                        if (Waze.model.segments.objects[c.segID].attributes.primaryStreetID==null) return msg;
                        if (Waze.model.streets.objects.hasOwnProperty(Waze.model.segments.objects[c.segID].attributes.primaryStreetID)==false) return msg;
                        var street = Waze.model.streets.objects[Waze.model.segments.objects[c.segID].attributes.primaryStreetID];
                        if (!street.isEmpty) msg = street.name + ': ' + msg;
                        return msg;
                    });
                    var mteOK=!(mte && (new Date(e.start) < new Date(mte.attributes.startDate) || new Date(e.end) > new Date(mte.attributes.endDate)));
                    return (reason +
                    //' (' + cllocation + '): ' + 
                    ': ' +
                    e.start + ' &#8594; ' + e.end + 
                    ' ' + directionStr + 
                    ' <i class="fa fa-car' + (isIT?" slashed":"") + '"></i>' +
                    (overlap.length!=0?' <i title="Warning: overlap on existing closure!\n' + overlap.join('\n') + '" class="fa fa-exclamation-circle" style="color: orange"></i>':'') +
                    (mteOK?'':' <i title="Warning: closure dates not inside MTE date!" class="fa fa-exclamation-circle" style="color: orange"></i>') +
                    ' <span id="wmeac-advanced-closure-dialog-preview-' + i + '"></span>');
            }).join('<br>'));
        }
    }
    catch (e)
    {
        WMEAC.logError("Error while refreshing closure list: ", e);
    }
};

WMEAC.refreshMTEList = function ()
{
    var currentMTEid = $("#wmeac-advanced-closure-dialog-mteid").val();
    var rangeStart = new Date($("#wmeac-advanced-closure-dialog-rangestartdate").val());
    var rangeEnd = new Date($("#wmeac-advanced-closure-dialog-rangeenddate").val());
    var options=[{name: 'none', value: ''}];
    $("#wmeac-advanced-closure-dialog-mteid").empty();
    if (WMEAC.isValidDate(rangeStart) && WMEAC.isValidDate(rangeEnd))
    {
        rangeEnd.addDays(1);
        // filter MTE loaded in WME:
        Waze.model.majorTrafficEvents.getObjectArray(function (mte) {
            // check if ranges overlap
            return (WMEAC.dateTimeOverlaps({startDate: rangeStart, endDate: rangeEnd}, {startDate: new Date(mte.attributes.startDate), endDate: new Date(mte.attributes.endDate)}));
        }).forEach(function (mte) {
            options.push({name: mte.attributes.names[0].value, value: mte.attributes.id});
        });
    }
    options.forEach(function (o) {
        var el = WMEAC.createElement({type: 'option'});
        el.setAttribute('value', o.value);
        if (currentMTEid==o.value)
            el.setAttribute('selected', '');
        el.innerHTML = o.name;
        $("#wmeac-advanced-closure-dialog-mteid").append(el);
    });
    if (options.length>1)
        $("#wmeac-advanced-closure-dialog-mteid").removeAttr('disabled');
    else
        $("#wmeac-advanced-closure-dialog-mteid").attr('disabled', '');
};

WMEAC.refreshClosureListFromSelection = function ()
{
    try
    {
        var currentSegClosure = $("#wmeac-advanced-closure-dialog-segclosure-list").val();
        $("#wmeac-advanced-closure-dialog-segclosure-list").empty();
        if (Waze.selectionManager.selectedItems.length!=0)
        {
            var blackList=[];
            Waze.model.roadClosures.getObjectArray(function (c) {
                return c.segID==Waze.selectionManager.selectedItems[0].model.attributes.id;
            }).sort(function (a,b) {
                return (new Date(a.startDate)-new Date(b.startDate));
            }).forEach(function (c) {
                if (blackList.indexOf(c.id)!=-1) return;
                var direction = c.forward?"A to B":"B to A";
                var oppositeClosure = WMEAC.getOppositeClosure(c);
                if (!oppositeClosure.isEmpty())
                {
                    direction = "Two way";
                    blackList.push(oppositeClosure[0].id);
                }
                var el = WMEAC.createElement({type: 'option'});
                el.setAttribute('value', c.id);
                if (currentSegClosure==c.id)
                    el.setAttribute('selected', '');
                el.innerHTML = c.reason.trim() + ' ' + direction + ' ' + c.startDate + '&#8594;' + c.endDate;
                $("#wmeac-advanced-closure-dialog-segclosure-list").append(el);
            });
        }
    }
    catch (e)
    {
        WMEAC.logError("Error while refreshing closure list from selection: ", e);
    }
};

INCLUDE_FILE('include/holidays.js');
