WMEAC.abbrToISO3166_1alpha2 = function (abbr)
{
    switch(abbr)
    {
        case 'GM':
            return 'DE';
        break;
        case 'BU':
            return 'BG';
        break;
        case 'EZ':
            return 'CZ';
        break;
        case 'SP':
            return 'ES';
        break;
        case 'UK':
            return 'GB';
        break;
        case 'LO':
            return 'SK';
        break;
        default:
            return abbr;
        break;
    }
    return abbr;
};

WMEAC.getHolidays = function (options)
{
    var holidays = [];
    var currentCountryIndex = 0;
    var rangeStart = new Date(options.rangeStart);
    var rangeEnd = new Date(options.rangeEnd).addDays(1);
    var years = [];
    for (y=parseInt(options.rangeStart.substring(0,4)); y<=parseInt(options.rangeEnd.substring(0,4)); y++) years.push(y);
    var currentYearIndex = 0;
    
    var tmp1 = function downloadNext() {
        if (currentCountryIndex>=options.countries.length)
            if (options.handlerFinished)
            {
                holidays.sort(function (a, b) {
                    return (new Date(a.date)-new Date(b.date));
                });
                holidays=holidays.filter(function (h, i) {
                    if (i!=0)
                    {
                        if (holidays[i-1].date==h.date)
                        {
                            holidays[i-1].name += ' / ' + h.name;
                            holidays[i-1].country += ' / ' + h.country;
                            return false;
                        }
                    }
                    return true;
                });
                options.handlerFinished(holidays);
                return;
            }
        window.WMEAC_downloadHelper.add(
            //"https://holidayapi.com/v1/holidays?country=" + WMEAC.abbrToISO3166_1alpha2(options.countries[currentCountryIndex]) + "&year=" + dateToNext.substring(0, 4) + "&month=" + dateToNext.substring(5, 7) + "&day=" + dateToNext.substring(8) + "&upcoming",
            "https://holidayapi.com/v1/holidays?key=ca1a7925-0045-47da-bcf6-ee0de583e384&country=" + WMEAC.abbrToISO3166_1alpha2(options.countries[currentCountryIndex]) + "&year=" + years[currentYearIndex],
            function (data) {
                if (data.status=='success')
                {
                    try {
                        nextHoliday = JSON.parse(data.data);
                        if (nextHoliday.hasOwnProperty('holidays'))
                        {
                            for (var hd in nextHoliday.holidays) {
                                if (!nextHoliday.holidays.hasOwnProperty(hd)) continue;
                                if (nextHoliday.holidays[hd].length==0) continue;
                                var name = _.map(nextHoliday.holidays[hd], 'name').join(' / ');
                                var h = nextHoliday.holidays[hd][0];
                                var d = new Date(h.date);
                                if (d>=rangeStart && d<rangeEnd)
                                {
                                    holidays.push({date: h.date, name: name, country: h.country});
                                }
                            }
                            currentYearIndex++;
                            if (currentYearIndex<years.length)
                            {
                                window.setTimeout(downloadNext);
                                return;
                            }
                        }
                    }
                    catch (e)
                    {
                        WMEAC.log ("Error while getting holiday from server!", e);
                        WMEAC.log ("data", data.data);
                    }
                    currentCountryIndex++;
                    currentYearIndex=0;
                    window.setTimeout(downloadNext);
                }
            }
        );
    };

    tmp1();

};