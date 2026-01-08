define([
    "jquery", 
    "d3", 
    "modules/slr-legend-item"
], function(
    jQuery, 
    d3, 
    SLRLegendItem
) {
    
    function UDALegendItem(uda, id) {
        this.uda                = uda;
        this._legendId          = id;
        this.udaLegendContainer = null;
        this.opacitySlider      = null;
        this.symbolRowElems     = [];
        this.svg                = null;
        this.btnClear           = null;
        this.btnUpload          = null;
        
        this._options = null;
        this._legend = null;
        this._udaOptions = null;
    }
    
    
    //********************************************************************************************************
    // Legend related
    //********************************************************************************************************
    UDALegendItem.prototype.init = function(legend, options, modalLegend, geomType) {
        var self = this;
        options = options ? JSON.parse(JSON.stringify(options)) : {};
        options.udaColor = options.udaColor ? options.udaColor : "#f00";
        options.width    = options.svgWidth ? options.svgWidth : legend.baseOptions.svgWidth;
        options.height   = options.svgHeight ? options.svgHeight : legend.baseOptions.svgHeight;
        options.padding  = options.svgPadding ? options.svgPadding : legend.baseOptions.svgPadding;
        options.id       = this._legendId;
        
        // create legend item
        legend.items["uda"]  = new SLRLegendItem("uda", options, legend._numItems++);
        var legendItemId = legend.items["uda"].id;
        
        // override item container
        this.udaLegendContainer = $("<div>", {"class": "slr-legend-item", "id": legendItemId})
            .appendTo(legend.container);
        legend.items["uda"].container = this.udaLegendContainer;
        
        // add label
        $("<div>", {"class": "slr-legend-main-label slr-legend-item-row"}).appendTo(this.udaLegendContainer)
            .html("User Data Upload");
    
        // add transparceny slider
        var opacityCtrlRow = $("<div>", {'class': "slr-legend-item-row slr-layer-opacity-ctrl"})
            .appendTo(this.udaLegendContainer)
            .append($("<label>", {html: "Opacity: "}));
        this.opacitySlider = $("<input>", {
                    type: "range", 
                    min: 0, 
                    max: 100, 
                    step: 1, 
                    value: 100
                })
            .val(
                options.opacity !== undefined ? options.opacity*100 : 100
            )
            .appendTo(opacityCtrlRow)
            .on('input', function() {
                self.uda.setUdaOpacity(this.value/100.0);
            });
        this.symbolRowElems.push(opacityCtrlRow);
        
        this._options = options;
        
        // add spacer as multi-class or gradients are encased in 'block' format
        this.symbolRowElems.push(
            $("<div>", {"class": "slr-legend-multi-spacer slr-legend-item-col"}).appendTo(this.udaLegendContainer)
        );
        
        // add empty svg
        this.symbolRowElems.push(
            $("<div>", {"class": "slr-legend-symbol slr-legend-item-col"}).appendTo(this.udaLegendContainer)
        );
        this.svg = d3.select("#" + legendItemId + " .slr-legend-symbol").append("svg")
                .attr("width", options.width)
                .attr("height", options.height);
        
        // add label
        var offset = 2*options.padding;
        this.symbolRowElems.push(
            $("<div>", {"class": "slr-legend-sub-label-wrapper slr-legend-item-col"})
                .appendTo(this.udaLegendContainer)
                .css({
                    "height": options.multi*options.height - offset,
                    "margin": offset + "px 0"
                })
                .append(
                    $("<div>", {"class": "slr-legend-sub-label"}).html("<p>User Defined Area</p>")
                )
        );
        
        if(!geomType) {
            this.setLegendStatus(false);
        } else {
            this.setLegendStatus(true);
            this.setSymbol(legend.items["uda"], geomType, options);
        }
        if(modalLegend) return;
        
        // add buttons
        var rowButtons = $("<div>", {'class': "slr-legend-item-row slr-legend-uda-ctrl"})
                             .appendTo(this.udaLegendContainer);
        this.btnClear = $("<button>", {'class': 'btn2', 'html': "Clear"})
            .appendTo(rowButtons)
            .prop('disabled', true)
            .on('click', function() {
                self.setLegendStatus(false);
                self.uda.clearUda();
            });
        this._legend = legend;
        this._udaOptions = options;
        this.btnUpload = $("<button>", {'class': 'btn2', 'html': "Upload"})
            .appendTo(rowButtons)
            .on('click', function() {
                self.uda.openUploadModal(function(geomType) {
                    self.update(geomType);
                });
            });
    };
    
    UDALegendItem.prototype.update = function(geomType) {
        this.setLegendStatus(true);
        this.setSymbol(this._legend.items["uda"], geomType, this._udaOptions);
    };
    
    UDALegendItem.prototype.setLegendStatus = function(visible) {
        for(var i = 0; i < this.symbolRowElems.length; ++i) {
            if(visible) {
                this.symbolRowElems[i].show();
            } else {
                this.symbolRowElems[i].hide();
            }
        }
        if(this.btnClear) {
            this.btnClear.prop('disabled', !visible);
        }
    };
    
    UDALegendItem.prototype.setSymbol = function(legendItem, geomType, options) {
        if(!options) options = this._options;
        
        this.svg.selectAll("g").remove();
        options = options ? JSON.parse(JSON.stringify(options)) : {};
        options.multi      = 1;
        options.svgWidth   = options.width;
        options.svgHeight  = options.height;
        options.svgPadding = options.padding;
        legendItem.options = options;
        switch(geomType) {
            case "Point":
            case "MultiPoint":
                options.fill       = options.udaColor;
                options.stroke     = "#fff";
                options.strokWidth = 1;
                options.symbol     = "point";
                break;
            case "LineString":
            case "MultiLineString":
                options.fill       = null;
                options.stroke     = options.udaColor;
                options.strokWidth = 2;
                options.symbol     = "line";
                break;
            case "Polygon":
            case "MultiPolygon":
                options.fill       = null;
                options.stroke     = options.udaColor;
                options.strokWidth = 2;
                options.symbol     = "poly";
                break;
        };
        if(options.symbol) legendItem._createLegendSymbol(this.svg, options);
    };
    
    return UDALegendItem;
    
});