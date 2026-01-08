if(!window._siteInit || !window._siteInit.debugSet) {
    if(window._siteInit && window._siteInit.debugMode) {
        console.debug = function(msg) {
            if(typeof msg === "string") {
                // this adds CSS to console log, which only works in chrome/firefox, but who cares since only 
                // used for debug purposes
                console.log("%cDEBUG: " + msg, "color:#888;");
            } else {
                console.log(msg);
            }
        };
    } else {
        console.debug = function() { };
    }
    window._siteInit.debugSet = true;
}