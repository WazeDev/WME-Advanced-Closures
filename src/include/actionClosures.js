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
        var c = new sc({reason: options.reason, direction: options.direction, startDate: options.startDate, endDate: options.endDate, location: options.location, permanent: options.permanent, segments: options.segments, reverseSegments: {}});
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
        WMEAC.reloadRoadLayer();
        if (endHandler) endHandler();
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

    var cab = require("Waze/Modules/Closures/Models/ClosureActionBuilder");
    var sc = require("Waze/Modules/Closures/Models/SharedClosure");
    var t = {};
    var segs = _.pluck(Waze.selectionManager.selectedItems, 'model');
   
    var c = new sc({reason: closureList[i].reason, direction: closureList[i].direction, startDate: closureList[i].startDate, endDate: closureList[i].endDate, location: closureList[i].location, permanent: closureList[i].permanent, segments: segs, reverseSegments: Waze.selectionManager.getReversedSegments()});
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
    
        var cab = require("Waze/Modules/Closures/Models/ClosureActionBuilder");
        var sc = require("Waze/Modules/Closures/Models/SharedClosure");
        var t = {};
        var segs = _.pluck(Waze.selectionManager.selectedItems, 'model');
        var c = new sc({reason: options.reason, direction: options.direction, startDate: options.startDate, endDate: options.endDate, location: options.location, permanent: options.permanent, segments: segs, reverseSegments: Waze.selectionManager.getReversedSegments()});
        t.actions=[cab.add(c)];
        W.controller.save(t).done(done()).fail(fail());
        return true;
    }
    return false;
};