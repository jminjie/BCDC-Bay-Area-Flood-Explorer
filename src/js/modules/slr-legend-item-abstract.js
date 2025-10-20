define(["d3"], function(d3) {
    
    function SLRLegendAbstract() {
        this.svgWidth   = 24;
        this.svgHeight  = 24;
        this.svgPadding = 2;
    };
    
    SLRLegendAbstract.prototype.exit = function() { };
    
    SLRLegendAbstract.prototype.updateControls = function(layer, container) {
        if(!container) container = this.itemContainer || this.container;  // not great, assumes child classes
        if(layer.opacity !== undefined) {
            var slider = container.find(".slr-layer-opacity-ctrl input");
            if(slider.length) slider.val(layer.opacity*100);
        }
        if(layer.visible !== undefined) {
            var checkbox = container.find(".slr-layer-visibility-ctrl input");
            if(checkbox.length) {
                checkbox.prop("checked", layer.visible);
                if(layer.visible) {
                    container.removeClass("legend-disabled");
                } else {
                    container.addClass("legend-disabled");
                }
            }
        }
    };
    
    SLRLegendAbstract.prototype._renderLegendItem = function(container, options, id, name, state) {
        container.html("");
        var mainLabel;
        state = state || options.state || {};
        if(!options.multiLayer) {
            var thisId = "svg-" + id;
            mainLabel = this._renderLegendItemIndividual(container, options, thisId, name, state);
        } else {
            // add label here
            mainLabel = $("<div>", {"class": "slr-legend-main-label slr-legend-item-row"}).appendTo(container)
                .html(options.mainLabel || this._safeArrayValue(options.label, 0));
            for(var i = 0; i < options.multiLayer; ++i) {
                // basic copy then assign values based on array (if existing)
                var theseOpts = Object.assign({}, options), 
                    layerHelpFunc = null;
                for(var key in theseOpts) {
                    if(key === "layerHelpFunction") {
                        layerHelpFunc = Array.isArray(theseOpts[key]) ? this._safeArrayValue(theseOpts[key], i) : null;
                    } else {
                        theseOpts[key] = this._safeArrayValue(theseOpts[key], i);
                    }
                }
                theseOpts._sublabel = true;
                var thisId = "svg-" + id + "-" + i, 
                    subLabel = this._renderLegendItemIndividual(container, theseOpts, thisId, name, state);
                if(subLabel && layerHelpFunc) {
                    $("<i>", {"class": "cm-icon", "text": "?"}).appendTo(subLabel)
                        .on("click", layerHelpFunc);
                }
            }
        }
        // Functionality block (do after adding item in case repositioning breaks listeners)
        if(!mainLabel) return;
        if(options.layerHelpFunction && !Array.isArray(options.layerHelpFunction)) {
            $("<i>", {"class": "cm-icon", "text": "?"}).appendTo(mainLabel)
                .on("click", options.layerHelpFunction);
        }
        if(options.layerVisFunction) {
            // simple checkbox for layer visibility
            var ctrl = $("<div>", {'class': "slr-layer-visibility-ctrl"}).appendTo(mainLabel)
                .append(
                    $("<input>", {
                        'type': "checkbox", 
                        'class': "checkbox", 
                        'checked': typeof state.visible === "undefined" ? "checked" : state.visible ? "checked" : ""
                    })
                    .on('click', function() {
                        if(this.checked) {
                            container.removeClass("legend-disabled");
                        } else {
                            container.addClass("legend-disabled");
                        }
                        options.layerVisFunction(this.checked);
                    })
                );
            if(options.visibility !== undefined && !options.visiblity) {
                container.addClass("legend-disabled");
            } else {
                ctrl.prop('checked', true);
            }
        }
        if(options.layerTransFunction) {
            var opacity = state.opacity ? state.opacity : (options.opacity !== undefined ? options.opacity : 1);
            // layer transparency slider
            $("<div>", {'class': "slr-legend-item-row slr-layer-opacity-ctrl"}).insertAfter(mainLabel)
                .append(
                    $("<label>", {html: "Transparency: "})
                )
                .append(
                    $("<input>", {
                        type: "range", 
                        min: 0, 
                        max: 100, 
                        step: 1, 
                        value: state
                    })
                    .val(100*opacity)
                    .on('input', function() {
                        options.layerTransFunction(this.value);
                    })
                )
                .on('touchmove touchend mousedown mousemove mouseup', function(evt) { evt.stopPropagation; });
        }
    };
    
    SLRLegendAbstract.prototype._renderLegendItemIndividual = function(container, options, id, name, state) {
        // label
        if(options.label && !options._hideLabel) {
            var label = null;
            if(!options._sublabel) {
                label = $("<div>", {"class": "slr-legend-main-label slr-legend-item-row"}).appendTo(container)
                    .html(options.label);
            } else {
                label = $("<div>", {"class": "slr-legend-main-label2 slr-legend-item-row"}).appendTo(container)
                    .html(options.label);
            }
        }
        //----------------------------------------------------------------------------------------------------
        // Legend symbol block
        //----------------------------------------------------------------------------------------------------
        // determine/enforce a few parameters based on options
        if(!options.multi || options.multi <= 0) options.multi = 1;
        var isGradient = options.symbol === "gradient";
        // add spacer as multi-class or gradients are encased in 'block' format
        $("<div>", {"class": "slr-legend-multi-spacer slr-legend-item-col"}).appendTo(container);
        if(isGradient) {
            options.gradientHeight = options.gradientHeight ? options.gradientHeight : 80;
            options.mutli = 1;  // multiple classes with gradients not supported
        }
        options.width   = options.svgWidth ? options.svgWidth : this.svgWidth;
        options.height  = isGradient 
                                  ? options.gradientHeight
                                  : (options.svgHeight ? options.svgHeight : this.svgHeight);
        options.padding = options.svgPadding ? options.svgPadding : this.svgPadding;
        // create SVG and symbol
        $("<div>", {
                "id": id, 
                "class": "slr-legend-symbol slr-legend-item-col"}
            ).appendTo(container);
        var svg = d3.select("#"+id + ".slr-legend-symbol").append("svg")
                .attr("width", options.width)
                .attr("height", options.multi*options.height);
        if(isGradient) {
            this._createLegendGradient(svg, options, id, name);
        } else {
            this._createLegendSymbol(svg, options, id);
        }
        //----------------------------------------------------------------------------------------------------
        // Label(s) block
        //----------------------------------------------------------------------------------------------------
        // add sublabels
        this._convertToArrays(options, ['sublabels'], options.multi);
        var len = options.sublabels.length > options.multi ? options.sublabels.length : options.multi, 
            offset = 2*options.padding, 
            subLabels = $("<div>", {"class": "slr-legend-sub-label-wrapper slr-legend-item-col"})
                .appendTo(container)
                .css({
                    "height": options.multi*options.height - offset,
                    "margin": offset + "px 0"
                });
        for(var i = 0; i < len; ++i) {
            subLabels.append(
                $("<div>", {"class": "slr-legend-sub-label" + (isGradient ? " slr-legend-label-gradient" : "")})
                    .html("<p>" + this._safeArrayValue(options.sublabels, i, "") + "</p>")
            );
        }
        // return label for use in other stuff
        return label;
    };
    
    SLRLegendAbstract.prototype._createLegendSymbol = function(svg, options, id) {
        options.width   = options.svgWidth ? options.svgWidth : this.svgWidth;
        options.height  = options.svgHeight ? options.svgHeight : this.svgHeight;
        options.padding = options.svgPadding ? options.svgPadding : this.svgPadding;
        var symbol = options.symbol.toLowerCase();
        if(symbol === "point") {
            this._convertToArrays(options, ['radius', 'fill', 'stroke', 'strokeWidth']);
            var y = 0, 
                defaultRadius = 0.35*options.height - options.padding;
            for(var i = 0; i < options.multi; ++i) {
                svg.append("g").append("circle")
                    .attr("cx", options.width*0.5)
                    .attr("cy", y+options.height*0.5)
                    .attr("r", this._safeArrayValue(options.radius, i, defaultRadius))
                    .attr("fill", this._safeArrayValue(options.fill, i, "rgba(0,0,0,0)"))
                    .attr("stroke", this._safeArrayValue(options.stroke, i))
                    .attr("stroke-width", this._safeArrayValue(options.strokeWidth, i));
                y += options.height;
            }
            
        } else if(symbol === "poly") {
            this._convertToArrays(options, ['fill', 'stroke', 'strokeWidth', 'nooutline']);
            var y = 0;
            for(var i = 0; i < options.multi; ++i) {
                var endX   = options.width - options.padding, 
                    startY = y + options.padding, 
                    endY   = y + options.height - options.padding, 
                    rect   = svg.append("g").append("rect");
                rect.attr("x", options.padding)
                    .attr("y", startY)
                    .attr("width", endX - options.padding)
                    .attr("height", endY - startY)
                    .attr("fill", this._safeArrayValue(options.fill, i, "rgba(0,0,0,0)"));
                if(!this._safeArrayValue(options.nooutline, i)) {
                    rect.attr("stroke", this._safeArrayValue(options.stroke, i))
                        .attr("stroke-width", this._safeArrayValue(options.strokeWidth, i));
                }
                y += options.height;
            }
            
        } else if(symbol === "line") {
            this._convertToArrays(options, ['stroke', 'strokeWidth']);
            var y = 0;
            for(var i = 0; i < options.multi; ++i) {
                var cy = y + 0.5*options.height;
                svg.append("g").append("path")
                    .attr("d", 
                        "M " + options.padding + " " + cy +
                        " L " + (options.width - options.padding) + " " + cy
                    )
                    .attr("stroke", this._safeArrayValue(options.stroke, i))
                    .attr("stroke-width", this._safeArrayValue(options.strokeWidth, i));
                y += options.height;
            }
            
        } else if(symbol === "hatch" || symbol === "crosshatch") {
            this._convertToArrays(options, ['fill', 'stroke', 'strokeWidth', 'nooutline']);
            var defs = svg.append("defs"), 
                y = 0;
            for(var i = 0; i < options.multi; ++i) {
                var hatchId = "svg-" + id + "-hatch-" + i, 
                    pattern = defs.append("pattern");
                pattern
                    .attr("id", hatchId)
                    .attr("width", 4)
                    .attr("height", 4)
                    .attr("patternTransform", "rotate(45 0 0)")
                    .attr("patternUnits", "userSpaceOnUse");
                pattern.append("line")
                    .attr("x1", 0).attr("y1", 0)
                    .attr("x2", 0).attr("y2", 4)
                    .style("stroke", this._safeArrayValue(options.stroke, i))
                    .style("stroke-width", this._safeArrayValue(options.strokeWidth, i));
                if(symbol === "crosshatch") {
                    pattern.append("line")
                        .attr("x1", 0).attr("y1", 0)
                        .attr("x2", 4).attr("y2", 0)
                        .style("stroke", this._safeArrayValue(options.stroke, i))
                        .style("stroke-width", this._safeArrayValue(options.strokeWidth, i));
                }
                var endX   = options.width - options.padding, 
                    startY = y + options.padding, 
                    endY   = y + options.height - options.padding, 
                    rect   = svg.append("g").append("rect");
                rect.attr("x", options.padding)
                    .attr("y", startY)
                    .attr("width", endX - options.padding)
                    .attr("height", endY - startY)
                    .attr("fill", "url(#" + hatchId + ")");
                if(!this._safeArrayValue(options.nooutline, i)) {
                    rect.attr("stroke", this._safeArrayValue(options.stroke, i))
                        .attr("stroke-width", this._safeArrayValue(options.strokeWidth, i));
                }
                y += options.height;
            }
        }
    };
    
    SLRLegendAbstract.prototype._createLegendGradient = function(svg, options, id, name) {
        this._convertToArrays(options, ['gradient']);
        var gradientId = "gradient-"+id+"-"+name,
            gradientStops = 100/(options.gradient.length-1), 
            gradientDef = svg.append("defs").append("linearGradient")
                .attr("id", gradientId)
                .attr("x1", "1")
                .attr("y1", "0")
                .attr("x2", "1")
                .attr("y2", "1")
                .attr("spreadMethod", "pad"), 
            stopPos = 0;
        for(var i = 0; i < options.gradient.length; i++) {
            gradientDef.append("stop")
                .attr("offset", stopPos+"%")
                .attr("stop-color", options.gradient[i])
                .attr("stop-opacity", 1);
            stopPos += gradientStops;
            if(stopPos > 100) stopPos = 100;
        }
        svg.append("g").append("rect")
            .attr("x", options.padding)
            .attr("y", options.padding)
            .attr("width", options.width - (2*options.padding))
            .attr("height", options.height - (2*options.padding))
            .attr("fill", "url(#"+gradientId+")");
    };
    
    SLRLegendAbstract.prototype._convertToArrays = function(object, keys, enforceMinLength) {
        for(var k = 0; k < keys.length; ++k) {
            if(!object[keys[k]]) {
                object[keys[k]] = [null];
            } else if(!$.isArray(object[keys[k]])) {
                object[keys[k]] = [object[keys[k]]];
            }
            if(enforceMinLength) {
                while(object[keys[k]].length < enforceMinLength) {
                    object[keys[k]].push(null);
                }
            }
        }
    };
    SLRLegendAbstract.prototype._safeArrayValue = function(arr, index, defaultValue) {
        if(!arr) return defaultValue;
        var val = index < arr.length ? arr[index] : arr[arr.length-1];
        return defaultValue === undefined || val || val === 0 ? val : defaultValue;
    };
    
    return SLRLegendAbstract;
    
});