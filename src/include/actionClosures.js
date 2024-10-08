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
    
        var cab = require("Waze/Modules/Closures/Models/ClosureActionBuilder");
        var sc = require("Waze/Modules/Closures/Models/SharedClosure");
        var t = {};
        var closureDetails = {reason: options.reason + String.fromCharCode(160), direction: options.direction, startDate: options.startDate, endDate: options.endDate, location: options.location, permanent: options.permanent, segments: options.segments, reverseSegments: {}};
        if (options.hasOwnProperty('eventId') && options.eventId!=null) closureDetails.eventId = options.eventId;
        var c = new sc(closureDetails, {dataModel: W.model, segmentSelection: W.selectionManager.getSegmentSelection(), isNew: true});
        t.actions=[cab.add(c)];
        W.controller.save(t).then(done()).catch(fail());
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
                f.errors.forEach(function (err) {
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

    var cab = require("Waze/Modules/Closures/Models/ClosureActionBuilder");
    var sc = require("Waze/Modules/Closures/Models/SharedClosure");
    var t = {};
    var segs = W.selectionManager.getSelectedDataModelObjects();
    var cityStreets = WMEAC.getCityStreetsFromSegmentSet(segs);
    var closureLocation = Object.keys(cityStreets).map(function (c) {
        return (Object.keys(cityStreets[c]).map(function (s) {
            if (s=='noStreet') return I18n.translations[I18n.locale].edit.address.no_street;
            return s;
        }).join(', ') + (c=='noCity'?'':' (' + c + ')'));
    }).join(' ; ');
        
    var closureDetails = {reason: closureList[i].reason + String.fromCharCode(160), direction: closureList[i].direction, startDate: closureList[i].startDate, endDate: closureList[i].endDate, location: closureLocation, permanent: closureList[i].permanent, segments: segs, reverseSegments: W.selectionManager.getReversedSegments()};
    if (closureList[i].hasOwnProperty('eventId') && closureList[i].eventId!=null) closureDetails.eventId = closureList[i].eventId;
    var c = new sc(closureDetails, {dataModel: W.model, segmentSelection: W.selectionManager.getSegmentSelection(), isNew: true});
    t.actions=[cab.add(c)];
    W.controller.save(t).then(done()).catch(fail());
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
    
        var cab = require("Waze/Modules/Closures/Models/ClosureActionBuilder");
        var sc = require("Waze/Modules/Closures/Models/SharedClosure");
        var t = {};
        var segs = W.selectionManager.getSelectedDataModelObjects();
        var closureDetails = {reason: options.reason + String.fromCharCode(160), direction: options.direction, startDate: options.startDate, endDate: options.endDate, location: options.location, permanent: options.permanent, segments: segs, reverseSegments: W.selectionManager.getReversedSegments()};
        if (options.hasOwnProperty('eventId') && options.eventId!=null) closureDetails.eventId = options.eventId;
        var c = new sc(closureDetails, {dataModel: W.model, segmentSelection: W.selectionManager.getSegmentSelection(), isNew: true});
        t.actions=[cab.add(c)];
        W.controller.save(t).then(done()).catch(fail());
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

    var cab = require("Waze/Modules/Closures/Models/ClosureActionBuilder");
    var sc = require("Waze/Modules/Closures/Models/SharedClosure");
    var t = {};
    let segs = WMEAC.segmentsIDsToSegments(closures.map(closure => closure.attributes.segID));
    segs = segs.filter(function (seg) {
        return seg.isAllowed(seg.permissionFlags.EDIT_CLOSURES);
    });
    t.actions=[cab.delete(W.model, new sc({segments: segs, closures: closures, reverseSegments: W.selectionManager.getReversedSegments()}, {dataModel: W.model, segmentSelection: W.selectionManager.getSegmentSelection(), isNew: true}))];
    W.controller.save(t).then(done()).catch(fail());
    return true;
};
