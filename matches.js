var matchesPart = function(pattern, against) {
    if(pattern.indexOf("*") < 0) {
        return pattern === against;
    }
    var pParts = pattern.split("."), 
        aParts = against.split(".");
    if(pParts.length !== aParts.length) {
        return false;
    }
    for(var i = 0; i < aParts.length; i++) {
        if(pParts[i] !== "*" && pParts[i] !== aParts[i]) {
            return false;
        }
    }
    return true;
};
var matches = function(pattern, against) {
    var inWc     = false, 
        wcPassed = false, 
        match    = false, 
        pi       = 0, 
        i        = -1;
    while(++i < against.length) {
        // check in wildcard
        if(pattern[pi] === "*") {
            ++pi;
            inWc = true;
            wcPassed = false;
        }
        // if end of pattern, must match
        if(pi === pattern.length) {
            return true;
        }
        // check match
        match = matchesPart(pattern[pi], against[i]);
        // based on wildcard status
        if(inWc && !wcPassed) {
            // if matching, passed wildcard
            if(match) {
                wcPassed = true;
                ++pi;
            }
            // if not matching, we're still in wildcard so continue w/o increment
        } else if(!match) {
            // no match, return false
            return false;
        } else {
            ++pi;
        }
    }
    return (!inWc || wcPassed) && match && pi === pattern.length;
};

module.exports = matches;