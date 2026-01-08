define([], function() {
    
    function SLRState() {
        this.__states = {};
        this.__listeners = {}; // add, remove, set, get
    }
    
    SLRState.prototype.add = function(key, iniValue) {
        if(key in this.__states) throw "State key already exists, remove via remove() to replace, no overwrite allowed.";
        this.__states[key] = iniValue;
        this.__on("add", key, iniValue);
        this.__on("set", key, iniValue);
    };
    
    SLRState.prototype.remove = function(key) {
        if(!(key in this.__states)) return;
        var val = this.__states[key];
        delete this.__states[key];
        this.__on("remove", key, null, val);
        return val;
    };
    
    SLRState.prototype.has = function(key) {
        return key in this.__states;
    };
    
    SLRState.prototype.set = function(key, value) {
        if(!(key in this.__states)) throw "State key does not exist.";
        var old = this.__states[key];
        this.__states[key] = value;
        this.__on("set", key, value, old);
        return old;
    };
    
    SLRState.prototype.get = function(key) {
        if(!(key in this.__states)) throw "State key does not exist.";
        this.__on("get", key, this.__states[key]);
        return this.__states[key];
    };
    
    SLRState.prototype.getState = function() {
        var ret = {};
        for(var key in this.__states) {
            this.__on("get", key, this.__states[key]);
            ret[key] = this.__states[key];
        }
        return ret;
    };
    
    SLRState.prototype.on = function(event, callback) {
        if(!(event in this.__listeners)) this.__listeners[event] = [];
        this.__listeners[event].push(callback);
    };
    
    SLRState.prototype.un = function(event, callback) {
        if(!(event in this.__listeners)) return;
        this.__listeners[event].filter(function(c) { return c !== callback; });
    };
    
    SLRState.prototype.__on = function(event, key, value, old) {
        if(!(event in this.__listeners)) return;
        var self = this;
        this.__listeners[event].forEach(function(callback) {
            callback.apply(self, [event, key, value, old]);
        });
    };
    
    SLRState.prototype.push = function(copyTo) {
        for(var key in this.__states) {
            this.__on("get", key, this.__states[key]);
            copyTo[key] = this.__states[key];
        }
        return copyTo;
    };
    
    return SLRState;
    
});