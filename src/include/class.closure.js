WMEAC.ClassClosure = function (options)
{
    WMEAC.log("options", options);
    this.isValid=false;
    this.errorMessage='';
    var validProperties=['reason', 'startDate', 'endDate', 'direction', 'segIDs', 'lonlat', 'permanent', 'id', 'zoom'];
    var goodOptions=0;
    validProperties.forEach(function (p) {
        if (options.hasOwnProperty(p))
        {
            this[p]=options[p];
            goodOptions++;
        }
        else
        {
            this.errorMessage+="Missing property " + p + "\n";
        }
    }, this);
    if (goodOptions==validProperties.length)
    {
        this.isValid=true;
    }
    else
    {
        return;
    }
    
    // optional options:
    this.comment="";
    if (options.hasOwnProperty('comment')) this.comment=options.comment;
    this.eventId=null;
    if (options.hasOwnProperty('eventId') && options.eventId!='') this.eventId=options.eventId;
    
    this.segIDs = this.segIDs.split(';');
    var matches = this.lonlat.match(/lon=(-?\d+\.?\d*)&lat=(-?\d+\.?\d*)/);
    if (matches && matches.length==3)
        this.lonlat = {lon: parseFloat(matches[1]), lat: parseFloat(matches[2])};
    else
    {
        matches = this.lonlat.match(/lat=(-?\d+\.?\d*)&lon=(-?\d+\.?\d*)/);
        if (matches && matches.length==3)
            this.lonlat = {lon: parseFloat(matches[2]), lat: parseFloat(matches[1])};
        else
        {
            this.isValid=false;
            this.errorMessage="Can't parse lonlat: " + this.lonlat + "\n";
            return;
        }
    }
    if (this.direction!="A to B" && this.direction!="B to A" && this.direction!="TWO WAY")
    {
        this.isValid=false;
        this.errorMessage="Can't determine direction: " + this.direction + "\n";
        return;        
    }
    this.zoom = parseInt(this.zoom);
    if (this.zoom<2||this.zoom>10)
    {
        this.isValid=false;
        this.errorMessage="Wrong zoom (2 to 10): " + this.zoom + "\n";
        return; 
    }
    this.applyInWME = function(successHandler, failureHandler)
    {
        // check if segments are on screen
        var segs = WMEAC.segmentsIDsToSegments(this.segIDs);
        WMEAC.log("Segs: ", segs);

        segs = segs.filter(function (seg) {
            return seg.isAllowed(seg.PERMISSIONS.EDIT_CLOSURES);
        });
                
        if (segs.length==0)
        {
            failureHandler([{attributes: {details: "No segment. Check permissions or existence."}}]);
        }
        else
        {
            var cityStreets = WMEAC.getCityStreetsFromSegmentSet(segs);
            var closureLocation = Object.keys(cityStreets).map(function (c) {
                return (Object.keys(cityStreets[c]).map(function (s) {
                    if (s=='noStreet') return I18n.translations[I18n.locale].edit.address.no_street;
                    return s;
                }).join(', ') + (c=='noCity'?'':' (' + c + ')'));
            }).join(' ; ');
            
            var sc = WMEAC.WMEAPI.require("Waze/Modules/Closures/Models/SharedClosure");
            var closureDetails = {reason: this.reason, direction: (this.direction=="A to B"?sc.DIRECTION.A_TO_B:(this.direction=="B to A"?sc.DIRECTION.B_TO_A:sc.DIRECTION.TWO_WAY)), startDate: this.startDate, endDate: this.endDate, location: closureLocation, permanent: this.permanent=='Yes', segments: segs};
            if (this.eventId!=null) closureDetails.eventId = this.eventId;
            WMEAC.addClosure(closureDetails, successHandler, failureHandler);
        }
    };
    this.removeInWME = function(successHandler, failureHandler)
    {
        var segs = WMEAC.segmentsIDsToSegments(this.segIDs);
        segs = segs.filter(function (seg) {
            return seg.isAllowed(seg.PERMISSIONS.EDIT_CLOSURES);
        });
        
        var allClosuresToRemove=[];
        var countToMatch=this.segIDs.length*(this.direction=="TWO WAY"?2:1); // two way = 2 closures in WME
        segs.forEach(function (s) {
            // look for closure(s)
            var that = this;
            var closures = Waze.model.roadClosures.getObjectArray(function (c) {
                return (c.startDate==that.startDate &&
                        c.endDate==that.endDate &&
                        c.reason.trim()==that.reason &&
                        c.segID==s.attributes.id &&
                        c.permanent == (that.permanent=='Yes'));
            });
            if ((this.direction=="TWO WAY") || // && closures.length==2 && closures[0].forward!=closures[1].forward) ||
                (this.direction=="A to B" && closures.length==1 && closures[0].forward==true) ||
                (this.direction=="B to A" && closures.length==1 && closures[0].forward==false))
            {
                allClosuresToRemove=allClosuresToRemove.concat(closures);
            }
        }, this);
        if (allClosuresToRemove.isEmpty())
        {
            failureHandler([{attributes: {details: "No segment. Check permissions or existence."}}]);
        }
        else
            WMEAC.removeClosure(allClosuresToRemove, successHandler, failureHandler);
    };
};