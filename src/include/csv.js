WMEAC.parseCSV = function (csvString)
{
    if (csvString!=null)
    {
        var csvArray = WMEAC.CSVtoArray(csvString);
        WMEAC.log("CSV as array:", csvArray);
        var isValid = WMEAC.csv[0].validate(csvArray);
        if (isValid.isValid)
            WMEAC.log("CSV is valid!");
        else
            WMEAC.log("CSV is NOT valid!:" + isValid.feedBack);
    }
};

WMEAC.CSVFileChanged = function (evt)
{
		var files = evt.target.files; // FileList object
		for (var i = 0, f; f = files[i]; i++)
		{
				var reader = new FileReader();
				reader.onload = (function(theFile) {
						return function(e) {
								WMEAC.log("import CSV file read");
                                WMEAC.parseCSV(e.target.result);
						};
				})(f);

				// Read in the image file as a data URL.
				reader.readAsText(f);
		}
  
};

WMEAC.ClassCSV = function (options)
{
    this.isValid=false;
    if (options.hasOwnProperty('version'))
        this.version=options.version;
    else return;
    if (options.hasOwnProperty('regexpValidation'))
        this.regexpValidation=options.regexpValidation;
    else return;
    this.isValid=true;
    
    this.validate = function(data)
    {
        var regexps = this.regexpValidation;
        var feedBack = "";
        data.forEach(function (line, l) {
            var isLineValid = line.reduce(function (stillValid, cell, i) {
                var isCellValid = cell.match(regexps[i])!=null;
                if (!isCellValid)
                    feedBack="Error while parsing line " + l + " cell " + i + ": \"" + cell + "\" in line " + line.join(',');
                return (stillValid && isCellValid);
            }, true);
        }, this);
        return {isValid: feedBack=="", feedBack: feedBack};
    };
    
    this.filter = function(data)
    {
        return data.filter(function (line) {
            return (line.length>=1 && line[0]!="header" && line[0]!="comment");
        });
    };
};

WMEAC.csv.push(new WMEAC.ClassCSV({version: 1, regexpValidation: [/(^header$)|(^comment$)|(^add$)/, // 1st cell
                                                                  /.*/, // reason is free
                                                                  /.*/, // location is free
                                                                  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, // start date
                                                                  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, // end date
                                                                  /(^A to B$)|(^B to A$)|(^TWO WAY$)/, // direction
                                                                  /^(\d+(;|$))+/ // seg ID list
                                                                  ]}));