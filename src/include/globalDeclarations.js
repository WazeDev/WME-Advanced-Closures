// create a custom date class with a few addl functions (originally in Datejs library).
class JDate extends Date {
	clone() { return new JDate(this); }
	addMinutes(value) {
		this.setMinutes(this.getMinutes() + value);
	}
	addDays(value) {
		this.setDate(this.getDate() + value);
	}
}

const scriptName = 'Advanced Closures';
const scriptId = 'advclosures';

var WMEAC={};

WMEAC.isDebug=false;
WMEAC.wmeSDK = null;

WMEAC.ac_version="<WMEACVERSION>";

WMEAC.closureTabTimeout=null;

WMEAC.csv=[];

WMEAC.csvCurrentClosureList=null;

WMEAC.csvCurrentBatchClosureList=null;

WMEAC.pendingOps=false;

WMEAC.pb = null;

WMEAC.daysOfWeek=[ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

WMEAC.lastGeneratedHolidays = [];

WMEAC.presets=[];

WMEAC.closeInsideNodes = false;