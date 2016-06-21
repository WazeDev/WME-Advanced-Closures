/**** DOWNLOAD HELPER **********************/
/******** AUTO INJECTED PART ***************/
function WMEAC_downloadHelperInjected()
{
    window.WMEAC_downloadHelper = {
        jobs: [],
        _waitForData: function (id)
        {
            if (this.jobs.length<=id)
            {
                this.jobs[id].callback({url: null, data: null, callback: this.jobs[id].callback, status: "error", error: "Request not found"});
            }
            else
            {
                if (this.jobs[id].status=="success" || this.jobs[id].status=="error")
                    this.jobs[id].callback(this.jobs[id]);
                else
                {
                    if (this.jobs[id].status=="downloading" && this.jobs[id].progressCallback)
                    {
                        this.jobs[id].progressCallback(this.jobs[id]);
                    }
                    var _this=this;
                    window.setTimeout(function () { _this._waitForData(id); }, 500);
                }
            }
        },
        add: function (url, callback, progressCallback)
        {
            
            this.jobs.push({url: url, data: null, callback: callback, progressCallback: progressCallback, status: "added", progression: 0, error: ""});
            var _this=this;
            window.setTimeout(function () { _this._waitForData(_this.jobs.length-1); }, 500);
        }
    };
}
var WMEAC_downloadHelperInjectedScript = document.createElement("script");
WMEAC_downloadHelperInjectedScript.textContent = '' + WMEAC_downloadHelperInjected.toString() + ' \n' + 'WMEAC_downloadHelperInjected();';
WMEAC_downloadHelperInjectedScript.setAttribute("type", "application/javascript");
document.body.appendChild(WMEAC_downloadHelperInjectedScript);

/******** SANDBOX PART ***************/

function lookFordownloadHelperJob()
{
    for (var i=0; i<unsafeWindow.WMEAC_downloadHelper.jobs.length; i++)
    {
        if (unsafeWindow.WMEAC_downloadHelper.jobs[i].status=="added")
        {
            unsafeWindow.WMEAC_downloadHelper.jobs[i].status = cloneInto( "downloading", unsafeWindow.WMEAC_downloadHelper.jobs[i]);
            
            var f = function () {
                var job=i;
                GM_xmlhttpRequest ( {
                    method: 'GET',
                    headers: {"User-Agent": "Mozilla/5.0", "Accept": "text/plain"}, 
                    synchronous: false,
                    timeout: 10000,
                    url: unsafeWindow.WMEAC_downloadHelper.jobs[job].url,
                    onerror: function(r) {
                        unsafeWindow.WMEAC_downloadHelper.jobs[job].status = cloneInto( "error", unsafeWindow.WMEAC_downloadHelper.jobs[job]);
                    },
                    ontimeout: function(r) {
                        console.debug("TOTO Timeout while getting area from server: " , r);
                        unsafeWindow.WMEAC_downloadHelper.jobs[job].status = cloneInto( "error", unsafeWindow.WMEAC_downloadHelper.jobs[job]);
                    },
                    onload: function(r) {
                        unsafeWindow.WMEAC_downloadHelper.jobs[job].status = cloneInto( "success", unsafeWindow.WMEAC_downloadHelper.jobs[job]);
                        unsafeWindow.WMEAC_downloadHelper.jobs[job].data = cloneInto( r.responseText, unsafeWindow.WMEAC_downloadHelper.jobs[job]);
                    },
                    onprogress: function (r) {
                        unsafeWindow.WMEAC_downloadHelper.jobs[job].progression = cloneInto( r.total==0?0:(r.loaded/r.total), unsafeWindow.WMEAC_downloadHelper.jobs[job]);
                    }
                } );
            }();
        }
    }
    window.setTimeout(lookFordownloadHelperJob, 2000);
}
window.setTimeout(lookFordownloadHelperJob);
