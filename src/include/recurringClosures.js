WMEAC.buildClosuresListFromRecurringUI = function ()
{
    var list = [];
    var rangeStartDate = new Date($('#wmeac-advanced-closure-dialog-rangestartdate').val());
    if (!WMEAC.isValidDate(rangeStartDate)) return {list: list, error: "Range start date is not valid"};
    
    var rangeEndDate = new Date($('#wmeac-advanced-closure-dialog-rangeenddate').val());
    if (!WMEAC.isValidDate(rangeEndDate)) return {list: list, error: "Range end date is not valid"};
    
    var dH = parseInt($('#wmeac-advanced-closure-dialog-duration-hour').val());
    if (isNaN(dH) || dH<0) return {list: list, error: "Duration hour is invalid"};
    
    var dM = parseInt($('#wmeac-advanced-closure-dialog-duration-minute').val());
    if (isNaN(dM) || dM<0 || dM>=60) return {list: list, error: "Duration minute is invalid"};
    
    if (dH==0 && dM==0) return {list: list, error: "Duration is null"};
    
    var rangeStartTimeM = $('#wmeac-advanced-closure-dialog-rangestarttime').val().split(':').map(function (e) {
        return parseInt(e);
    }).reduce(function (p, c, i) {
        return (p*60+c);
    });
    
    var rangeEndTimeM = $('#wmeac-advanced-closure-dialog-rangeendtime').val().split(':').map(function (e) {
        return parseInt(e);
    }).reduce(function (p, c, i) {
        return (p*60+c);
    });
    
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
        
        var firstDateTimeStart = rangeStartDate;
        if (startTimeM<rangeStartTimeM) // starts the day after
            firstDateTimeStart.addDays(1);
        firstDateTimeStart.setMinutes(startTimeM);
        
        var firstDateTimeEnd = firstDateTimeStart.clone();
        firstDateTimeEnd.addMinutes(dH * 60 + dM);
        
        WMEAC.log("1st: " + WMEAC.dateToClosureStr(firstDateTimeStart));
        
        list.push({start: WMEAC.dateToClosureStr(firstDateTimeStart), end: WMEAC.dateToClosureStr(firstDateTimeEnd)});
        
        for (var i=1; i<ntimes; i++)
        {
            var start = firstDateTimeStart.clone();
            start.addMinutes((evH * 60 + evM)*i);
            var end = start.clone();
            end.addMinutes(dH * 60 + dM);
            if (end > rangeEndDateTime) // stop if after range end
                break;
            list.push({start: WMEAC.dateToClosureStr(start), end: WMEAC.dateToClosureStr(end)});
        }
        
        return {list: list, error: ""};
    }
    // if mode is EACH
    else if ($('#wmeac-advanced-closure-dialog-tabeach').attr('class').indexOf('active')!=-1)
    {
        
    }
    else
        return {list: list, error: "Wrong tab active"};

};