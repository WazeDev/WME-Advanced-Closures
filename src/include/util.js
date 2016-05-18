WMEAC.shuffleArray = function (array) {
		for (var i = array.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var temp = array[i];
				array[i] = array[j];
				array[j] = temp;
		}
		return array;
};

WMEAC.getElementsByClassName=function (classname, node) {
		if(!node) node = document.getElementsByTagName("body")[0];
		var a = [];
		var re = new RegExp('\\b' + classname + '\\b');
		var els = node.getElementsByTagName("*");
		for (var i=0,j=els.length; i<j; i++)
				if (re.test(els[i].className)) a.push(els[i]);
				return a;
};

WMEAC.getElementByDataID=function (dID, node) {
		if(!node) node = document.getElementsByTagName("body")[0];
		var a = [];
		var re = new RegExp('\\b' + dID + '\\b');
		var els = node.getElementsByTagName("*");
		for (var i=0,j=els.length; i<j; i++)
				if (re.test(els[i].getAttribute("data-id"))) a.push(els[i]);
				return a;
};

WMEAC.removeChildElements = function (node)
{
		while (node.firstChild)
		{
				WMEAC.removeChildElements(node.firstChild);
				node.removeChild(node.firstChild);
		}
};

WMEAC.createElement = function (options)
{
	if (options.hasOwnProperty('type')==false)
		return null;
	var el=document.createElement(options.type);
	
	if (options.hasOwnProperty('id')==true)
		el.id=options.id;
	
	if (options.hasOwnProperty('className')==true)
		el.className=options.className;
	
	return el;
};

WMEAC.getId = function (node) {
		var el = document.getElementById(node);
		return el;
};

WMEAC.logBeta = function (msg, obj)
{
		//log("Beta - " + msg, obj);
};

WMEAC.logDebug = function (msg, obj)
{
		if (WMEAC.isDebug) WMEAC.log("DEBUG - " + msg, obj);
};


WMEAC.log = function (msg, obj)
{
		if (obj==null)
				console.log("Advanced closures v" + WMEAC.ac_version + " - " + msg);
		else
				console.debug("Advanced closures v" + WMEAC.ac_version + " - " + msg + " " ,obj);
};

WMEAC.setTimeoutArgs = function (func, args, delay)
{
		window.setTimeout(
				(
						function ()
						{
								var json_args = JSON.stringify(args);
								return function()
								{
										var args = JSON.parse(json_args);
										func.apply(this, args);
								}
						}
				)() , delay);
};

WMEAC.invertObject = function (obj) {
		
		var new_obj = {};
		
		for (var prop in obj) {
				if(obj.hasOwnProperty(prop)) {
						new_obj[obj[prop]] = prop;
				}
		}
		
		return new_obj;
};

WMEAC.listToObject = function (arr) {
		var o = {};
		for (var i = 0; i < arr.length; ++i)
				o[arr[i].id] = i;
			//o[arr[i].id] = arr[i];
		return o;
};

WMEAC.getDuration = function (ts)
{
		var aDate = new Date();
		var now = aDate.getTime();
		var duration = now-ts;    
		aDate.setHours(0);
		aDate.setMinutes(0);
		aDate.setSeconds(0);
		aDate.setMilliseconds(0);    
		var startOfDay=aDate.getTime();
		
		if(duration<now-startOfDay)
				return 0;
		
		return Math.ceil((duration-(now-startOfDay)) / 86400000);
};

WMEAC.escapeHtml = function (text) {
		return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
};

WMEAC.decimalToHex = function (d, padding) {
		var hex = Number(d).toString(16);
		padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
		
		while (hex.length < padding) {
				hex = "0" + hex;
		}
		
		return hex;
};

WMEAC.isDescendant = function (parent, child) {
	var node = child.parentNode;
	while (node != null) {
		if (node == parent) {
			return true;
		}
		node = node.parentNode;
	}
  return false;
};


// http://stackoverflow.com/questions/8493195/how-can-i-parse-a-csv-string-with-javascript
WMEAC.CSVtoArray = function (text) {
    var b = [];
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    
    var lines = text.split('\n');
    lines.forEach(function (line) {
        if (!re_valid.test(line)) return;
        var a = [];                     // Initialize array to receive values.
        line.replace(re_value, // "Walk" the string using replace with callback.
            function(m0, m1, m2, m3) {
                // Remove backslash from \' in single quoted values.
                if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
                // Remove backslash from \" in double quoted values.
                else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
                else if (m3 !== undefined) a.push(m3);
                return ''; // Return empty string.
            });
        // Handle special case of empty last value.
        if (/,\s*$/.test(line)) a.push('');
        b.push(a);
    });
    return b;
};