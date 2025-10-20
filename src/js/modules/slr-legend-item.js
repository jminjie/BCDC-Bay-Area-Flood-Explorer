define(["modules/slr-legend-item-abstract"], function(SLRLegendItemAbstract) {
    
    function SLRLegendItem(name, options, index) {
        SLRLegendItemAbstract.call(this);
        this.name      = name;
        this.options   = options;
        this.index     = index;
        this.id        = "slr-legend-" + (options.id || (new Date()).getTime()) + "-" + this.name;
        this.container = $("<div>", {"class": "slr-legend-item", "id": this.id});
    };
    SLRLegendItem.prototype = Object.create(SLRLegendItemAbstract.prototype);
    
    SLRLegendItem.prototype.exit = function() {
        this.container = null;
    };
    
    SLRLegendItem.prototype._render = function() {
        this._renderLegendItem(this.container, this.options, this.id, this.name);
    };
    
    return SLRLegendItem;
    
});