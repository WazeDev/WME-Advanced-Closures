WMEAC.addClosure = function (options, successHandler, failureHandler)
{
    if (options &&
        options.hasOwnProperty('segments') &&
        options.hasOwnProperty('reason') &&
        options.hasOwnProperty('direction') &&
        options.hasOwnProperty('startDate') &&
        options.hasOwnProperty('endDate') &&
        options.hasOwnProperty('location') &&
        options.hasOwnProperty('permanent'))
    {
        WMEAC.log("Addinf closure: ", options);
        var fail = function (e) {
            return function (f) {
                if (failureHandler)
                    failureHandler(f);
                else
                    WMEAC.log("Failed to create closure:", f);
            };
        };
        var done = function (e) {
            return function (f) {
                if (successHandler)
                    successHandler(f);
                else
                    WMEAC.log("Closure successful:", f);
            };
        };
    
        var cab = WMEAC.WMEAPI.require("Waze/Modules/Closures/Models/ClosureActionBuilder");
        var sc = WMEAC.WMEAPI.require("Waze/Modules/Closures/Models/SharedClosure");
        var t = {};
        var closureDetails = {reason: options.reason + String.fromCharCode(160), direction: options.direction, startDate: options.startDate, endDate: options.endDate, location: options.location, permanent: options.permanent, segments: options.segments, reverseSegments: {}};
        if (options.hasOwnProperty('eventId') && options.eventId!=null) closureDetails.eventId = options.eventId;
        var c = new sc(closureDetails);
        t.actions=[cab.add(c)];
        W.controller.save(t).done(done()).fail(fail());
        return true;
    }
    return false;
};

WMEAC.addClosureListFromSelection = function (closureList, successHandler, failureHandler, endHandler, i)
{
    if (i>=closureList.length)
    {
        WMEAC.reloadClosuresLayer(function () {
            if (endHandler) endHandler();
        });
        return;
    }
    
    var c=closureList[i];
    var fail = function (e) {
        return function (f) {
            if (failureHandler)
            {
                var details = [];
                f.forEach(function (err) {
                    if (err.hasOwnProperty('attributes') && err.attributes.hasOwnProperty('details'))
                        details.push(err.attributes.details);
                });
                failureHandler(i, details.join (' | '));
            }
            else
                WMEAC.log("Failed to create closure:", f);
            WMEAC.addClosureListFromSelection(closureList, successHandler, failureHandler, endHandler, i+1);
        };
    };
    var done = function (e) {
        return function (f) {
            if (successHandler)
            {
                successHandler(i, "OK");
            }
            else
                WMEAC.log("Closure successful:", f);
            WMEAC.addClosureListFromSelection(closureList, successHandler, failureHandler, endHandler, i+1);
        };
    };

    var cab = WMEAC.WMEAPI.require("Waze/Modules/Closures/Models/ClosureActionBuilder");
    var sc = WMEAC.WMEAPI.require("Waze/Modules/Closures/Models/SharedClosure");
    var t = {};
    var segs = _.pluck(Waze.selectionManager.selectedItems, 'model');
    var cityStreets = WMEAC.getCityStreetsFromSegmentSet(segs);
    var closureLocation = Object.keys(cityStreets).map(function (c) {
        return (Object.keys(cityStreets[c]).map(function (s) {
            if (s=='noStreet') return I18n.translations[I18n.locale].edit.address.no_street;
            return s;
        }).join(', ') + (c=='noCity'?'':' (' + c + ')'));
    }).join(' ; ');
        
    var closureDetails = {reason: closureList[i].reason + String.fromCharCode(160), direction: closureList[i].direction, startDate: closureList[i].startDate, endDate: closureList[i].endDate, location: closureLocation, permanent: closureList[i].permanent, segments: segs, reverseSegments: Waze.selectionManager.getReversedSegments()};
    if (closureList[i].hasOwnProperty('eventId') && closureList[i].eventId!=null) closureDetails.eventId = closureList[i].eventId;
    var c = new sc(closureDetails);
    t.actions=[cab.add(c)];
    W.controller.save(t).done(done()).fail(fail());
};

WMEAC.addClosureFromSelection = function (options, successHandler, failureHandler)
{
    if (options &&
        options.hasOwnProperty('reason') &&
        options.hasOwnProperty('direction') &&
        options.hasOwnProperty('startDate') &&
        options.hasOwnProperty('endDate') &&
        options.hasOwnProperty('location') &&
        options.hasOwnProperty('permanent'))
    {
        WMEAC.log("Addinf closure: ", options);
        var fail = function (e) {
            return function (f) {
                if (failureHandler)
                    failureHandler(f);
                else
                    WMEAC.log("Failed to create closure:", f);
            };
        };
        var done = function (e) {
            return function (f) {
                if (successHandler)
                    successHandler(f);
                else
                    WMEAC.log("Closure successful:", f);
            };
        };
    
        var cab = WMEAC.WMEAPI.require("Waze/Modules/Closures/Models/ClosureActionBuilder");
        var sc = WMEAC.WMEAPI.require("Waze/Modules/Closures/Models/SharedClosure");
        var t = {};
        var segs = _.pluck(Waze.selectionManager.selectedItems, 'model');
        var closureDetails = {reason: options.reason + String.fromCharCode(160), direction: options.direction, startDate: options.startDate, endDate: options.endDate, location: options.location, permanent: options.permanent, segments: segs, reverseSegments: Waze.selectionManager.getReversedSegments()};
        if (options.hasOwnProperty('eventId') && options.eventId!=null) closureDetails.eventId = options.eventId;
        var c = new sc(closureDetails);
        t.actions=[cab.add(c)];
        W.controller.save(t).done(done()).fail(fail());
        return true;
    }
    return false;
};

WMEAC.removeClosure = function (closures, successHandler, failureHandler)
{
    var fail = function (e) {
        return function (f) {
            if (failureHandler)
                failureHandler(f);
            else
                WMEAC.log("Failed to delete closure:", f);
        };
    };
    var done = function (e) {
        return function (f) {
            if (successHandler)
                successHandler(f);
            else
                WMEAC.log("Closure deletion successful:", f);
        };
    };

    var cab = WMEAC.WMEAPI.require("Waze/Modules/Closures/Models/ClosureActionBuilder");
    var sc = WMEAC.WMEAPI.require("Waze/Modules/Closures/Models/SharedClosure");
    var t = {};
    var c = new sc({closures: [].concat(closures)});
    t.actions=[cab.delete(c)];
    W.controller.save(t).done(done()).fail(fail());
    return true;
};