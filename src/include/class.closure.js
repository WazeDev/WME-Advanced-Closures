WMEAC.ClassClosure = function (options)
{
    WMEAC.log("options", options);
    this.isValid=false;
    this.errorMessage='';
    var validProperties=['reason', 'location', 'startDate', 'endDate', 'direction', 'segIDs', 'lonlat', 'permanent', 'id', 'zoom'];
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
    this.segIDs = this.segIDs.split(';');
    var matches = this.lonlat.match(/lon=(-?\d+\.?\d*)&lat=(-?\d+\.?\d*)/);
    if (matches && matches.length==3)
        this.lonlat = {lon: parseFloat(matches[1]), lat: parseFloat(matches[2])};
    else
    {
        matches = this.lonlat.match(/lat=(-?\d+\.?\d*)&lon=(-?\d+\.?\d*)/);
        if (matches && matches.length==3)
            this.lonlat = {lon: parseFloat(matches[2]), lat: parseFloat(matches[1])}
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
            var sc = require("Waze/Modules/Closures/Models/SharedClosure");
            
            WMEAC.addClosure({reason: this.reason, direction: (this.direction=="A to B"?sc.DIRECTION.A_TO_B:(this.direction=="B to A"?sc.DIRECTION.B_TO_A:sc.DIRECTION.TWO_WAY)), startDate: this.startDate, endDate: this.endDate, location: this.location, permanent: this.permanent=='Yes', segments: segs}, successHandler, failureHandler);
        }
    };
};