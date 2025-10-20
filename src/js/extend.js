define(function() {
    // Input object is never modified, however, if no extension, may return as reference.
    return function(obj, extend, allowOverwrite) {
        if(!obj) return extend;
        if(!extend) return obj;
        var clone = {};
        for(var key in obj) {
            clone[key] = obj[key];
        }
        for(var key in extend) {
            if(allowOverwrite || !(key in clone)) {
                clone[key] = extend[key];
            }
        }
        return clone;
    };
});