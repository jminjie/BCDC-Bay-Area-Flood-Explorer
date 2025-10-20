define(["modules/slr-legend-item-abstract"], function(SLRLegendItemAbstract) {
    
    function SLRLegendWidget(name, label, layerHandler, options) {
        SLRLegendItemAbstract.call(this);
        options = options || {};
        this.isWidget      = true;
        this.name          = name;
        this.label         = label;
        this.layerHandler  = layerHandler;
        this.options       = null;
        this.index         = null;
        this.id            = null;
        this.container     = null;
        this.ctrlContainer = null;
        this.itemContainer = null;
        this.emptyMessage  = options.emptyMessage;
        this.layerHelpFunc = options.layerHelpFunction;
        this._lastSelected = false;
        this._linked       = [];
        this._onSwap       = null;
    };
    SLRLegendWidget.prototype = Object.create(SLRLegendItemAbstract.prototype);
    
    SLRLegendWidget.prototype.exit = function() {
        this.container = null;
        this.ctrlContainer = null;
        this.itemContainer = null;
        this.layerHandler = null;
    };
    
    SLRLegendWidget.prototype.onSwap = function(callback) {
        this._onSwap = callback;
    };
    
    SLRLegendWidget.prototype.link = function(name, layerkey, icon, legendOptions) {
        if(this.isAttached()) throw Exception("Widget already attached.");
        this._linked.push({
            name: name, 
            layer: layerkey, 
            icon: icon, 
            legend: legendOptions, 
            opacity: 100
        });
    };
    
    SLRLegendWidget.prototype.has = function(name) {
        return !!this._linked.find(function(item) { return item.layer === name; });
    };
    
    SLRLegendWidget.prototype._set = function(options) {
        this.id = "slr-legend-" + (options.id || (new Date()).getTime()) + "-" + this.name;
        this.container = $("<div>", {"class": "slr-legend-widget", "id": this.id});
    };
    
    SLRLegendWidget.prototype.isAttached = function() {
        return !!this.container;
    };
    
    SLRLegendWidget.prototype._render = function() {
        this.container.html("");
        
        if(this.label) {
            var label = $("<div>", {"class": "slr-legend-main-label slr-legend-item-row"})
                .html(this.label)
                .appendTo(this.container);
            if(this.layerHelpFunc) {
                $("<i>", {"class": "cm-icon", text: "?"}).appendTo(label)
                    .on("click", this.layerHelpFunc);
            }
        }
        
        this.ctrlContainer = $("<div>", {"class": "slr-legend-widget-control"}).appendTo(this.container);
        this.itemContainer = $("<div>", {"class": "slr-legend-item", html: this._default}).appendTo(this.container);
        if(this.emptyMessage) {
            this.emptyMessage = $("<p>", {
                "class": "slr-widget-empty", 
                html: this.emptyMessage
            }).appendTo(this.container);
        }
        var self = this;
        $("<button>", {
                "class": "slr-widget-button cm-tooltip-top", 
                "value": null, 
                "cm-tooltip-msg": "Clear", 
                "html": "<i>&#x1f5d9;</i>"
            })
            .appendTo(self.ctrlContainer);
        this._linked.forEach(function(item) {
            var btn = $("<button>", {
                    "class": "slr-widget-button cm-tooltip-top", 
                    "value": item.layer, 
                    "cm-tooltip-msg": item.name
                })
                .appendTo(self.ctrlContainer);
            if(item.icon) {
                $("<img>", {src: item.icon}).appendTo(btn);
            }
        });
        
        var btns = this.ctrlContainer.find(".slr-widget-button");
        btns.on("click", function() {
            self._swap(this.value, this);
            this.blur();
        });
    };
    
    SLRLegendWidget.prototype._swap = function(layer, btn, visible) {
        if(!btn) {
            btn = this.ctrlContainer.find(".slr-widget-button[value="+layer+"]");
            btn = btn.length ? btn[0] : null;
        }
        this.ctrlContainer.find(".slr-widget-button").removeClass("selected");
        if(btn && btn.value) btn.classList.add("selected");
        
        visible = visible || typeof visible === "undefined";
        var self = this, 
            last = this._lastSelected, 
            somethingOn = false;
        this._linked.forEach(function(item) {
            var isItem = item.layer === layer;
            self.layerHandler.setVisible(item.layer, visible && isItem);
            if(isItem) {
                somethingOn = true;
                self._lastSelected = layer;
                self._renderLegendItem(
                    self.itemContainer, 
                    item.legend, 
                    self.id, 
                    item.layer, 
                    {opacity: self.layerHandler.getOpacity(layer)}
                );
            }
        });
        if(somethingOn) {
            if(this.emptyMessage) this.emptyMessage.hide();
        } else {
            this.itemContainer.html("");
            if(this.emptyMessage) this.emptyMessage.show();
            this._lastSelected = false;
        }
        if(this._onSwap) this._onSwap(layer, last);
    };
    
    SLRLegendWidget.prototype.getSelected = function() {
        return this._lastSelected;
    };
    
    return SLRLegendWidget;
    
});