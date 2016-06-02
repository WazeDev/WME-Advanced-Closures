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
            start.addDays(d);
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
    else
        return {list: list, error: "Wrong tab active"};

};