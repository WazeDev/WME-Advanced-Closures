WMEAC.parseCSV = function ()
{
    if (WMEAC.lastCSVFile!=null)
    {
        var csvArray = WMEAC.CSVtoArray(WMEAC.lastCSVFile);
        WMEAC.log("CSV as array:", csvArray);
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
								WMEAC.lastCSVFile=e.target.result;
								WMEAC.log("import CSV file read");
						};
				})(f);

				// Read in the image file as a data URL.
				reader.readAsText(f);
		}
  
};