define([
    "jquery", 
    "extend", 
    "modules/slr-legend-item", 
    "text!../partials/text/legend-intro.html"
], function(
    jQuery, 
    extend, 
    SLRLegendItem, 
    legendText
) {
    
    function SLRLegend(container, layerHandler, id, onSwap) {
        this.id = id ? id: (new Date()).getTime();
        this.container = $("<div>", {
                'class': "slr-legend", 
                'id': "slr-legend-" + this.id
            }).prependTo(container);
        this.container.append(legendText);
        this._numItems = 0;
        this.items = {};
        this._layerHandler = layerHandler;
        this._rememberVisibility = {};
        this._onSwap = onSwap;
        
        this.baseOptions = {
            svgWidth:   24, 
            svgHeight:  24, 
            svgPadding: 2
        };
    };
    
    SLRLegend.prototype.exit = function() {
        for(var key in this.items) {
            this.items[key].exit();
        }
        this.items = null;
        this._layerHandler = null;
        this.container = null;
        this._rememberVisibility = null;
    };
    
    SLRLegend.prototype.addItem = function(name, options) {
        options = extend(this.baseOptions, options);
        options.id = this.id;
        var legendItem = new SLRLegendItem(name, options, (options.index || this.numItems));
        if(name in this.items) this.removeItem(name);
        this.__append(legendItem);
        this.items[name] = legendItem;
        if(this._layerHandler) {
            this._rememberVisibility[name] = this._layerHandler.getState(name).visible;
        }
    };
    
    SLRLegend.prototype.removeItem = function(name) {
        if(!(name in this.items)) return;
        var delIndex = this.items[name].index;
        this.items[key].container.remove();
        delete this.items[name];
        --this._numItems;
        for(var key in this.items) {
            if(this.items[key].index > delIndex) {
                --this.items[key].index;
            }
        }
    };
    
    SLRLegend.prototype.addWidget = function(name, widget) {
        if(widget.isAttached()) throw Exception("Widget already attached.");
        var options = extend(this.baseOptions, options);
        options.id = this.id;
        widget._set(options, (options.index || this.numItems));
        if(name in this.items) this.removeItem(name);
        this.__append(widget);
        this.items[name] = widget;
        if(this._layerHandler) {
            var selected = widget.getSelected();
            if(selected) this._rememberVisibility[name] = this._layerHandler.getState(selected).visible;
        }
        // scroll to when selecting widget
        var self = this;
        widget.onSwap(function(selected, last) {
            if(self._onSwap) self._onSwap.call(this, selected, last);
        });
    };
    
    SLRLegend.prototype.removeWidget = function(name) {
        this.removeItem(name);
    };
    
    SLRLegend.prototype.getItems = function() {
        var ret = [];
        for(var key in this.items) ret.push(this.items[key]);
        return ret;
    };
    
    SLRLegend.prototype.syncWidgetsOneWay = function(name, other) {
        if(!(name in this.items) || !this.items[name].isWidget) return;
        var thisWidget = this.items[name];
        if(!(name in other.items) || !other.items[name].isWidget) return;
        var thatWidget = other.items[name];
        // sync to other first
        thisWidget._swap(thatWidget.getSelected());
        // update swap listener
        var self = this;
        thisWidget.onSwap(function(selected, last) {
            if(self._onSwap) self._onSwap.call(this, selected, last);
            // changes on this will sync other
            thatWidget._swap(selected);
        });
    };
    
    SLRLegend.prototype.showItem = function(name) {
        if(name in this.items) {
            this.items[name].container.show();
            if(!this.items[name].isWidget) {
                var visible = true;
                if(name in this._rememberVisibility) {
                    visible = this._rememberVisibility[name];
                    delete this._rememberVisibility[name];
                }
                if(this._layerHandler) {
                    this._layerHandler.setVisible(name, visible);
                    this.items[name].updateControls(this._layerHandler.getState(name));
                } else {
                    this.items[name].updateControls({visibile: visible});
                }
            } else {
                var selected = this.items[name].getSelected();
                if(this._layerHandler) this._layerHandler.setVisible(selected, true);
            }
        }
    };
    
    SLRLegend.prototype.hideItem = function(name) {
        if(name in this.items) {
            this.items[name].container.hide();
            if(this.items[name].isWidget) name = this.items[name].getSelected();
            if(name && this._layerHandler) {
                this._rememberVisibility[name] = this._layerHandler.getVisible(name);
                this._layerHandler.setVisible(name, false);
            }
        }
    };
    
    SLRLegend.prototype._restore = function(name, state) {
        // select item in widget (without turning layer on - will actually turn it off)
        if(state.visible || state.hiddenByMode) {
            for(var key in this.items) {
                if(this.items[key].isWidget && this.items[key].has(name)) {
                    this.items[key]._swap(name, null, false);
                    break;
                }
            }
        }
        if(this._layerHandler) {
            // set opacity/visibility while suppressing on-change listeners
            this._layerHandler.setOpacity(name, state.opacity, true);
            this._layerHandler.setVisible(name, state.visible && !state.hiddenByMode, true);
        }
        // if hidden by mode or not visible, set memory
        if(state.hiddenByMode) {
            this._rememberVisibility[name] = true;
        } else if(!state.visible) {
            this._rememberVisibility[name] = false;
        }
    };
    
    SLRLegend.prototype.__append = function(legendItem) {
        if(legendItem.index >= this._numItems) {
            this.container.append(legendItem.container);
            legendItem._render();
            ++this._numItems;
            return;
        }
        var inserted = false, 
            orderedKeys = [];
        for(var key in this.items) { orderedKeys.push({key: key, index: this.items[key].index}); }
        orderedKeys = orderedKeys.sort(function(a, b) { return a.index - b.index; })
                                 .map(function(i) { return i.key; });
        for(var i = 0; i < orderedKeys.length; ++i) {
            var item = this.items[orderedKeys[i].key];
            if(item.index === legendItem.index) {
                legendItem.container.insertBefore(item.container);
                inserted = true;
                ++item.index;
            } else if(item.index < legendItem.index) {
                if(!inserted) {
                    legendItem.container.insertBefore(item.container);
                    break;
                }
                ++item.index;
            }
        }
        if(!inserted) this.container.append(legendItem.container);
        legendItem._render();
        ++this._numItems;
    };
    
    SLRLegend.prototype.updateLegendControls = function(layerMap) {
        for(var key in this.items) {
            if(!(key in layerMap)) continue;
            this.items[key].updateControls(layerMap[key]);
        }
    };
    
    return SLRLegend;
    
});