define(["jquery", "common"], function(jQuery, common) {
    
    function SiteElement(selector) {
        this.value = this.selector = selector;
    };
    
    SiteElement.prototype.asId = function() {
        var firstSel = this.value.split(/[ \.]+/)[0];
        return firstSel.startsWith("#") ? firstSel.substr(1) : null;
    };
    
    SiteElement.prototype.asJQuery = function() {
        return $(this.value);
    };
    
    SiteElement.prototype.asElement = function() {
        return document.querySelectorAll(this.value);
    };
    
    SiteElement.prototype.asElementSingle = function() {
        var e = this.asElement();
        return e.length ? e[0] : null;
    };
    
    SiteElement.prototype.createElement = function(elemType, appendTo) {
        elemType = elemType || "div";
        if(this.value.split(" ").length > 1) {
            throw Exception("Cannot create nested elements for: '" + this.value + "'");
        }
        var el = document.createElement(elemType);
        if(appendTo) appendTo.append(el);
        
        var hasId = false, 
            runningValue = "", 
            knownIdentifiers = ["#", ".", ":", "[", "]"], 
            lastIdentifier = null;
        var addProperty = function() {
            switch(lastIdentifier) {
                case "#":
                    if(hasId) throw Exception("Element cannot have more than one id");
                    el.setAttribute("id", runningValue);
                    hasId = true;
                    break;
                case ".":
                    el.classList.add(runningValue);
                    break;
            }
            runningValue = "";
            lastIdentifier = null;
        };
        for(var c = 0; c < this.value.length; ++c) {
            var char = this.value[c];
            if(char === ' ' || ~knownIdentifiers.indexOf(char)) {
                addProperty();
                lastIdentifier = char;
            } else {
                runningValue += char;
            }
        }
        addProperty();
        return el;
    };
    
    SiteElement.prototype.createAsJQuery = function(elemType) {
        return $(this.createElement(elemType));
    };
    
    return SiteElement;
    
});

