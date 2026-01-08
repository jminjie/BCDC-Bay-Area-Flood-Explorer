define([
    "extend", 
    "OpenLayers", 
    "common", 
    "centroid", 
    "modules/slr-legend-widget"
], function(
    extend, 
    ol,
    common, 
    centroid, 
    SLRLegendWidget
) {
    
    function SLRLayers(config) {
        this._wasInit = false;
        // TODO: this will change in the future
        this.mapServerUrl = config.mapServerUrls.local;
        this.mapFilePath  = config.mapServerUrls.mapFilePath;
        this.mapCacheUrl  = config.mapServerUrls.cache;
        
        // create Web Mercator tilegrid
        this.webMercator       = ol.proj.get("EPSG:3857");
        var zoomLevels         = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 
            projectionExtent   = this.webMercator.getExtent(), 
            tileSize           = ol.extent.getWidth(projectionExtent) / 256;
        this.tileGrid          = new ol.tilegrid.WMTS({
                                     origin: ol.extent.getTopLeft(projectionExtent),
                                     resolutions: zoomLevels.map(function(z) { return tileSize / Math.pow(2,z); }),
                                     matrixIds: zoomLevels
                                 });
        this._layers           = {};
        this._olMap            = null;
        this.selectedCounty    = null;
        this._onChange         = null;
        this._glossaryFunction = null;
    };
    
    SLRLayers.prototype.init = function(olMap, legend, onComplete, glossaryFunction) {
        if(this._wasInit) {
            if(onComplete) onComplete();
            onComplete = null;
            return;
        }
        this._olMap = olMap;
        this._glossaryFunction = glossaryFunction;
        this._initRegionalLayers();
        this._initInundationLayers();
        this._initConsequenceLayers();
        this._initCountyLayer(onComplete);
        this.__initLegend(legend);
        this.updateLayers();
        this._wasInit = true;
        this._olMap = null;
    };
    
    SLRLayers.prototype.exit = function() {
        for(var key in this._layers) {
            if(this._layers[key].exit) {
                this._layers[key].exit(this._layers[key].layers);
            }
            this._layers[key].sources = null;
            delete this._layers[key];
        }
        this._layers = null;
    };
    
    SLRLayers.prototype.addLayer = function(key, layers, options) {
        if(key in this._layers) throw Exception("Layer key already exists.");
        options = options || {};
        var defn = {
            layers:                  layers && !Array.isArray(layers) ? [layers] : layers, 
            layerNameFunction:       options.layerNameFunction, 
            isMapCache:              !!options.isMapCache, 
            clickSource:             options.clickSource, 
            clickSourceNameFunction: options.clickSourceNameFunction, 
            sources:                 options.useSourceMap ? {} : false, 
            hasZeroLayer:            !!options.hasZeroLayer, 
            noUpdate:                !!options.noUpdate, 
            exit:                    options.exit
        };
        if(options.clickOnly) options.visible = true;
        this._layers[key] = defn;
        var self = this;
        defn.layers.forEach(function(layer) {
            if(typeof options.visible !== "undefined") layer.setVisible(options.visible);
            if(typeof options.opacity !== "undefined") layer.setOpacity(options.opacity);
            if(!options.clickOnly) self._olMap.addLayer(layer);
        });
    };
    
    SLRLayers.prototype.getLayerKeys = function() {
        return Object.keys(this._layers);
    };
    
    SLRLayers.prototype.getLayers = function(key) {
        return key in this._layers ? this._layers[key].layers : [];
    };
    
    SLRLayers.prototype.getLayerClickSource = function(key) {
        return key in this._layers ? this._layers[key].clickSource : null;
    };
    
    SLRLayers.prototype.getState = function(key) {
        var state = {};
        if(!key) {
            for(key in this._layers) {
                var defn = this._layers[key];
                state[key] = {
                    visible: defn.layers[0].getVisible(), 
                    opacity: defn.layers[0].getOpacity()
                };
            }
        } else if(key in this._layers) {
            var defn = this._layers[key];
            state = {
                visible: defn.layers[0].getVisible(), 
                opacity: defn.layers[0].getOpacity()
            };
        }
        return state;
    };
    
    SLRLayers.prototype.getOpacity = function(name) {
        return name in this._layers ? this._layers[name].layers[0].getOpacity() : false;
    };
    
    SLRLayers.prototype.setOpacity = function(name, opacity, suppressOnChange) {
        if(!(name in this._layers)) return false;
        var layers = this._layers[name].layers;
        layers.forEach(function(layer) { layer.setOpacity(opacity); });
        if(!suppressOnChange && this._onChange) this._onChange();
    };
    
    SLRLayers.prototype.getVisible = function(name) {
        return name in this._layers ? this._layers[name].layers[0].getVisible() : false;
    };
    
    SLRLayers.prototype.setVisible = function(name, visibility, suppressOnChange) {
        if(!(name in this._layers)) return false;
        var layers = this._layers[name].layers, 
            lastState = layers[0].getVisible(), 
            changed = !lastState !== !visibility;
        if(changed) {
            layers.forEach(function(layer) { layer.setVisible(visibility); });
            if(!suppressOnChange && this._onChange) this._onChange();
        }
        return lastState;
    };
    
    SLRLayers.prototype.onChange = function(callback) {
        this._onChange = callback;
    };
    
    SLRLayers.prototype.highlightCounty = function(feature) {
        // source for selected county layer (see _initCountyLayer())
        var source = this._layers["counties"].layers[1].getSource();
        source.clear(true);
        if(feature) {
            source.addFeature(new ol.Feature({
                geometry: feature.getGeometry()
            }));
        }
        this.selectedCounty = feature ? feature.get("NAME").toLowerCase() : null;
    };
    
    SLRLayers.prototype.updateLayers = function(slr) {
        slr = !slr || slr <= 0 ? 0 : parseInt(slr);
        var self = this;
        for(var key in this._layers) {
            var defn = this._layers[key];
            if(defn.noUpdate) continue;
            if(defn.sources) {
                // static type, unique layer per TWL
                defn.layers.forEach(function(lyr) {
                    if(!slr && !defn.hasZeroLayer) {
                        lyr.setSource(false);
                        lyr.changed();
                        return;
                    }
                    if(!(slr in defn.sources)) {
                        if(defn.isMapCache) {
                            defn.sources[slr] = new ol.source.WMTS({
                                servertype: "mapserver", 
                                url: self.mapCacheUrl + "/wmts", 
                                matrixSet: "GoogleMapsCompatible",
                                format: "image/png", 
                                layer: defn.layerNameFunction(slr), 
                                projection: self.webMercator, 
                                tileGrid: self.tileGrid
                            });
                        } else {
                            defn.sources[slr] = new ol.source.TileWMS({
                                servertype: "mapserver", 
                                url: self.mapServerUrl + "?map=" + self.mapFilePath, 
                                params: {layers: defn.layerNameFunction(slr)}
                            });
                        }
                    }
                    lyr.setSource(defn.sources[slr]);
                    lyr.changed();
                });
            } else {
                // dynamic type, same layer, update twl parameter
                defn.layers.forEach(function(lyr) {
                    if(defn.layerNameFunction) {
                        lyr.getSource().updateParams({layers: defn.layerNameFunction(slr)});
                    } else {
                        var src = lyr.getSource(), 
                            params = src.getParams();
                        if(!slr && !defn.hasZeroLayer) {
                            delete params.twl;
                        } else {
                            params.twl = slr;
                        }
                        src.updateParams(params);
                    }
                    lyr.changed();
                });
            }
            if(defn.clickSource && defn.clickSourceNameFunction) {
                defn.clickSource.updateParams({layers: defn.clickSourceNameFunction(slr)});
            }
        }
    };
    
    SLRLayers.prototype._initRegionalLayers = function() {
        this.addLayer(
            "focusareas", 
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    servertype: "mapserver", 
                    url: this.mapServerUrl + "?map=" + this.mapFilePath, 
                    params: {layers: "focusareas"}
                })
            }), 
            {noUpdate: true, clickOnly: true}
        );
        /*
        this.addLayer(
            "legaldelta", 
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    servertype: "mapserver", 
                    url: this.mapServerUrl + "?map=" + this.mapFilePath, 
                    params: {layers: "legaldelta"}
                })
            }), 
            {noUpdate: true}
        );
        */
        this.addLayer(
            "oceanhash", 
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    servertype: "mapserver", 
                    url: this.mapServerUrl + "?map=" + this.mapFilePath, 
                    params: {layers: "oceandeltahash"}
                })
            }), 
            {noUpdate: true}
        );
        this.addLayer(
            "ecchash", 
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    servertype: "mapserver", 
                    url: this.mapServerUrl + "?map=" + this.mapFilePath, 
                    params: {layers: "ecchash"}
                })
            }), 
            {noUpdate: true}
        );
    };
    
    SLRLayers.prototype._initCountyLayer = function(onComplete) {
        var self = this, 
            styles = {
                normal: [new ol.style.Style({
                    fill: null, 
                    stroke: null // Exploratorium modification - no county lines
                    /*
                    stroke: new ol.style.Stroke({
                        color: "#aaa", 
                        width: 2
                    })
                    */
                })], 
                selected: [new ol.style.Style({
                    fill: null, 
                    stroke: null // Exploratorium modification - no county lines
                    /*
                    stroke: new ol.style.Stroke({
                        color: "#D4FF6E", 
                        width: 3
                    })
                    */
                })], 
                label: function(feature) {
                    var fillColor   = "#fff", 
                        strokeColor = "#555";
                    if(self.selectedCounty && self.selectedCounty === feature.get("label").toLowerCase()) {
                        fillColor   = "#000";
                        strokeColor = "#D4FF6E";
                    }
                    return new ol.style.Style({
                        text: new ol.style.Text({
                            placement: "point",
                            font: "bolder 14px Verdana,Geneva,sans-serif",
                            text: feature.get("label"), 
                            fill: new ol.style.Fill({ color: fillColor }), 
                            stroke: new ol.style.Stroke({ color: strokeColor, width: 4 })
                        })
                    });
                }
            };
        
        var counties = new ol.layer.Vector({
                source: new ol.source.Vector({
                    url: "data/sfbay-counties.json", 
                    format: new ol.format.TopoJSON({
                        defaultDataProjection: "EPSG:3857", 
                        layers: ["bay_counties_webmerc"]
                    }),
                    overlaps: false
                }), 
                style: styles.normal
            }), 
            countySelect = new ol.layer.Vector({
                source: new ol.source.Vector(), 
                style: styles.selected
            }), 
            countyLabels = new ol.layer.Vector({
                source: new ol.source.Vector(), 
                style: styles.label, 
                minResolution: 40
            });
        countyLabels.setStyle(null);
        counties.getSource().clear();
        countySelect.getSource().clear();
        countyLabels.getSource().clear();
        
        // Ensure labels created after loading (otherwise done on empty layer)
        var self           = this, 
            doOnce         = true, 
            countiesSource = counties.getSource(),
            onCountyLoad   = function() {
                if(doOnce && countiesSource.getState() === "ready") {
                    doOnce = false;
                    var labelSource = countyLabels.getSource();
                    countiesSource.forEachFeature(function(feat) {
                        var labelFeature = new ol.Feature({
                                geometry: new ol.geom.Point(
                                    centroid(feat.getGeometry().getCoordinates()[0])
                                )
                            });
                        labelFeature.set("label", feat.get("NAME"));
                        labelSource.addFeature(labelFeature);
                    });
                    countiesSource.un('change', onCountyLoad);
                    onCountyLoad = null;
                    if(onComplete) onComplete();
                    onComplete = null;
                    countiesSource = null;
                }
            };
        countiesSource.on('change', onCountyLoad);
        
        this.addLayer(
            "counties", 
            [counties, countySelect, countyLabels], 
            {
                noUpdate: true, 
                exit: function(layers) {
                    // otherwise we have a self-reference in the style function
                    layers[2].setStyle(null);
                    layers[0].getSource().clear();
                    layers[1].getSource().clear();
                    layers[2].getSource().clear();
                }
            }
        );
    };
    
    SLRLayers.prototype._initInundationLayers = function() {
        this.addLayer(
            "inundation", 
            new ol.layer.Tile({source: null}), 
            {
                isMapCache: true, 
                useSourceMap: true, 
                layerNameFunction: function(slr) { return "inundation"+slr+"cache"; }, 
                clickSource: new ol.source.TileWMS({
                    servertype: "mapserver", 
                    url: this.mapServerUrl + "?map=" + this.mapFilePath, 
                    params: {layers: "inundation0"}
                }), 
                clickSourceNameFunction: function(slr) { return "inundation"+slr; }
            }
        );
        this.addLayer(
            "inundation2", 
            new ol.layer.Tile({source: null}), 
            {
                isMapCache: true, 
                useSourceMap: true, 
                layerNameFunction: function(slr) { return "inundation"+slr+"cache"; }, 
                clickSource: new ol.source.TileWMS({
                    servertype: "mapserver", 
                    url: this.mapServerUrl + "?map=" + this.mapFilePath, 
                    params: {layers: "inundation0"}
                }), 
                clickSourceNameFunction: function(slr) { return "inundation"+slr; }, 
                opacity: 0.7
            }
        );
        this.addLayer(
            "lowlying", 
            new ol.layer.Tile({source: null}), 
            {
                useSourceMap: true, 
                layerNameFunction: function(slr) { return "lowlying"+slr; }, 
                clickSource: new ol.source.TileWMS({
                    servertype: "mapserver", 
                    url: this.mapServerUrl + "?map=" + this.mapFilePath, 
                    params: {layers: "lowlying0"}
                }), 
                clickSourceNameFunction: function(slr) { return "lowlying"+slr; }, 
                visible: false, 
                opacity: 0.7
            }
        );
        /*
        // Exploratorium modification -- remove shoreline overtopping
        this.addLayer(
            "overtopping", 
            new ol.layer.Tile({source: null}), 
            {
                isMapCache: true, 
                useSourceMap: true, 
                layerNameFunction: function(slr) { return "overtopping"+slr+"cache"; }, 
                clickSource: new ol.source.TileWMS({
                    servertype: "mapserver", 
                    url: this.mapServerUrl + "?map=" + this.mapFilePath, 
                    params: {layers: "overtopping0"}
                }), 
                clickSourceNameFunction: function(slr) { return "overtopping"+slr; }
            }
        );
        */
    };
    
    SLRLayers.prototype._initConsequenceLayers = function() {
        this.addLayer(
            "consq-hwy-vehicle", 
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    servertype: "mapserver", 
                    url: this.mapServerUrl + "?map=" + this.mapFilePath, 
                    params: {layers: "consequence_highway_vehicle"}
                })
            }), 
            {visible: false}
        );
        this.addLayer(
            "consq-hwy-truck", 
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    servertype: "mapserver", 
                    url: this.mapServerUrl + "?map=" + this.mapFilePath, 
                    params: {layers: "consequence_highway_truck"}
                })
            }), 
            {visible: false}
        );
        this.addLayer(
            "consq-rail", 
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    servertype: "mapserver", 
                    url: this.mapServerUrl + "?map=" + this.mapFilePath, 
                    params: {layers: "consequence_rail"}
                })
            }), 
            {visible: false}
        );
        this.addLayer(
            "consq-recreation", 
            new ol.layer.Tile(false), 
            {
                useSourceMap: true, 
                layerNameFunction: function(slr) { return "consequence_recreation_"+slr; }, 
                visible: false, 
                opacity: 0.7
            }
        );
        this.addLayer(
            "consq-tidalhabitat", 
            new ol.layer.Tile(false), 
            {
                useSourceMap: true, 
                hasZeroLayer: true, 
                layerNameFunction: function(slr) {
                    if(!slr) {
                        return "consequence_tidalmarsh";
                    } else {
                        return "consequence_tidalhabitat_"+slr+",consequence_tidalmarsh";
                    }
                }, 
                visible: false, 
                opacity: 0.7
            }
        );
        this.addLayer(
            "consq-housing", 
            new ol.layer.Tile(false), 
            {
                useSourceMap: true, 
                layerNameFunction: function(slr) { return "consequence_housing_"+slr; }, 
                visible: false, 
                opacity: 0.7
            }
        );
        this.addLayer(
            "consq-jobs", 
            new ol.layer.Tile(false), 
            {
                useSourceMap: true, 
                layerNameFunction: function(slr) { return "consequence_jobs_"+slr; }, 
                visible: false, 
                opacity: 0.7
            }
        );
        this.addLayer(
            "consq-vulcom-social", 
            new ol.layer.Tile(false), 
            {
                useSourceMap: true, 
                layerNameFunction: function(slr) { return "consequence_vulcom_social_"+slr; }, 
                visible: false, 
                opacity: 0.7
            }
        );
        this.addLayer(
            "consq-vulcom-contam", 
            new ol.layer.Tile(false), 
            {
                useSourceMap: true, 
                layerNameFunction: function(slr) { return "consequence_vulcom_contam_"+slr; }, 
                visible: false, 
                opacity: 0.7
            }
        );
    };
    
    SLRLayers.prototype.__initLegend = function(legend, baseOptions, onComplete) {
        var self = this;
        
        var consequenceWidget = new SLRLegendWidget(
            "consequence", 
            "Select Consequence", 
            this, 
            {
                layerHelpFunction: function(evt) {
                    if(!self._glossaryFunction) return;
                    evt.stopPropagation();
                    self._glossaryFunction("consequence", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
                }
            }
        );
        consequenceWidget.link("Highways and\nBridges (Vehicles)", "consq-hwy-vehicle", "images/Transportation_VehicleTraffic.png", {
            multiLayer: 1, 
            mainLabel: "Highways and Bridges", 
            label: ["Daily Vehicle Traffic (Vehicles (AADT))"], 
            symbol: ["line"], 
            multi: [3], 
            fill: [null], 
            stroke: [["#ED6E22", "#BE0031", "#793518"]], 
            strokeWidth: [4], 
            sublabels: [["18,476 - 48,500", "48,501 - 161,000", "161,000 - 275,000"]], 
            layerTransFunction: function(range) {
                self.setOpacity("consq-hwy-vehicle", range/100.0);
            }, 
            layerHelpFunction: [function(evt) {
                if(!self._glossaryFunction) return;
                evt.stopPropagation();
                self._glossaryFunction("highways-vehicles", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
            }]
        });
        consequenceWidget.link("Highways and\nBridges (Trucks)", "consq-hwy-truck", "images/Transportation_TruckTraffic.png", {
            multiLayer: 1, 
            mainLabel: "Highways and Bridges", 
            label: ["Daily Truck Traffic (Trucks (AADTT))"], 
            symbol: ["line"], 
            multi: [3], 
            fill: [null], 
            stroke: [["#ED6E22", "#BE0031", "#793518"]], 
            strokeWidth: [4], 
            sublabels: [["623 - 2,133", "2,135 - 5,900", "5,901 - 25,359"]], 
            layerTransFunction: function(range) {
                self.setOpacity("consq-hwy-truck", range/100.0);
            }, 
            layerHelpFunction: [function(evt) {
                if(!self._glossaryFunction) return;
                evt.stopPropagation();
                self._glossaryFunction("highways-trucks", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
            }]
        });
        consequenceWidget.link("Commuter Rail", "consq-rail", "images/Transportation_CommuterRail.png", {
            multiLayer: 2, 
            mainLabel: "Commuter Rail", 
            label: ["Passenger Flow (Daily Average Passengers)", "Station Ridership (Daily Average Passengers)"], 
            symbol: ["line", "poly"], 
            multi: [3, 3], 
            fill: [null, ["#ED6E22", "#BE0031", "#793518"]], 
            stroke: [["#ED6E22", "#BE0031", "#793518"], null], 
            strokeWidth: [4, 0], 
            sublabels: [
                ["471 - 2,263", "2,264 - 9,287", "9,288 - 236,300"], 
                ["0 - 679", "680 - 4,204", "4,205 - 97,052"]
            ], 
            layerTransFunction: function(range) {
                self.setOpacity("consq-rail", range/100.0);
            }, 
            layerHelpFunction: [
                function(evt) {
                    if(!self._glossaryFunction) return;
                    evt.stopPropagation();
                    self._glossaryFunction("commuter-rail-lines", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
                }, 
                function(evt) {
                    if(!self._glossaryFunction) return;
                    evt.stopPropagation();
                    self._glossaryFunction("commuter-rail-stations", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
                }
            ]
        });
        consequenceWidget.link("Vulnerable\nCommunities\n(Social)", "consq-vulcom-social", "images/VulnerableCommunities_Social.png", {
            multiLayer: 1, 
            mainLabel: "Vulnerable Communities", 
            label: ["Socially Vulnerable Housing (Residential Units (2010) per census block group)"], 
            symbol: ["poly"], 
            multi: [3], 
            fill: [["#828DC3", "#6A6D90", "#404459"]], 
            sublabels: [["1 - 440", "441 - 2,350", "2,351 - 6,379"]], 
            layerTransFunction: function(range) {
                self.setOpacity("consq-vulcom-social", range/100.0);
            }, 
            layerHelpFunction: [function(evt) {
                if(!self._glossaryFunction) return;
                evt.stopPropagation();
                self._glossaryFunction("vulcom-social-res", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
            }]
        });
        consequenceWidget.link("Vulnerable\nCommunities\n(Contamination)", "consq-vulcom-contam", "images/VulnerableCommunities_Contamination.png", {
            multiLayer: 1, 
            mainLabel: "Vulnerable Communities", 
            label: ["Contamination Vulnerabile Housing (Residential Units (2010) per census block group)"], 
            symbol: ["poly"], 
            multi: [3], 
            fill: [["#828DC3", "#6A6D90", "#404459"]], 
            sublabels: [["0 - 78", "79 - 293", "294 - 6,379"]], 
            layerTransFunction: function(range) {
                self.setOpacity("consq-vulcom-contam", range/100.0);
            }, 
            layerHelpFunction: [function(evt) {
                if(!self._glossaryFunction) return;
                evt.stopPropagation();
                self._glossaryFunction("vulcom-contam-res", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
            }]
        });
        consequenceWidget.link("Housing\nand Jobs\n(Housing)", "consq-housing", "images/FutureGrowth_Housing.png", {
            multiLayer: 1, 
            mainLabel: "Housing and Jobs", 
            label: ["Housing (Residential Units (2010) per census block group)"], 
            symbol: ["poly"], 
            multi: [3], 
            fill: [["#109ECD", "#1C889D", "#06597C"]], 
            sublabels: [["1 - 84", "85 - 334", "335 - 6,331"]], 
            layerTransFunction: function(range) {
                self.setOpacity("consq-housing", range/100.0);
            }, 
            layerHelpFunction: [function(evt) {
                if(!self._glossaryFunction) return;
                evt.stopPropagation();
                self._glossaryFunction("res-units", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
            }]
        });
        consequenceWidget.link("Housing and\nJobs (Jobs)", "consq-jobs", "images/FutureGrowth_Jobs.png", {
            multiLayer: 1, 
            mainLabel: "Housing and Jobs", 
            label: ["Jobs (Job Spaces (2010) per census block group)"], 
            symbol: ["poly"], 
            multi: [3], 
            fill: [["#109ECD", "#1C889D", "#06597C"]], 
            sublabels: [["1 - 45", "46 - 479", "480 - 6,379"]], 
            layerTransFunction: function(range) {
                self.setOpacity("consq-jobs", range/100.0);
            }, 
            layerHelpFunction: [function(evt) {
                if(!self._glossaryFunction) return;
                evt.stopPropagation();
                self._glossaryFunction("job-spaces", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
            }]
        });
        consequenceWidget.link("Natural Lands", "consq-tidalhabitat", "images/NaturalLands_TidalMarsh.png", {
            multiLayer: 2, 
            mainLabel: "Natural Lands", 
            label: [null, "Tidal Marsh Impacted (Acres per county)"], 
            symbol: ["poly", "poly"], 
            multi: [1, 3], 
            fill: [["#734C00"], ["#42A858", "#348F58", "#2B6647"]], 
            sublabels: [["Existing Tidal Marsh"], ["0 - 2,548", "2,548 - 4,448", "4,448 - 12,787"]], 
            layerTransFunction: function(range) {
                self.setOpacity("consq-tidalhabitat", range/100.0);
            }, 
            layerHelpFunction: [function(evt) {
                if(!self._glossaryFunction) return;
                evt.stopPropagation();
                self._glossaryFunction("tidal-marsh", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
            }]
        });
        consequenceWidget.link("Recreation", "consq-recreation", "images/NaturalLands_Recreation.png", {
            multiLayer: 1, 
            mainLabel: "Recreation", 
            label: ["Visitation (Photos User Days per county)"], 
            symbol: ["poly"], 
            multi: [3], 
            fill: [["#42A858", "#348F58", "#2B6647"]], 
            sublabels: [["Low", "Medium", "High"]], 
            layerTransFunction: function(range) {
                self.setOpacity("consq-recreation", range/100.0);
            }, 
            layerHelpFunction: [function(evt) {
                if(!self._glossaryFunction) return;
                evt.stopPropagation();
                self._glossaryFunction("photo-user-days", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
            }]
        });
        legend.addWidget("consequence", consequenceWidget);
        
        legend.addItem("inundation2", extend(baseOptions, {
            index: 1, 
            label: "Depth of Flooding", 
            symbol: "poly", 
            multi: 7, 
            fill: ["#98edf0", "#80c7e0", "#68a1d0", "#507bc0", "#3855b0", "#202fa0", "#090991"], 
            sublabels: ["0 - 2 feet", "2 - 4 feet", "4 - 6 feet", "6 - 8 feet", "8 - 10 feet", "10 - 12 feet", "12+ feet"], 
            layerVisFunction: function(selected) {
                self.setVisible("inundation2", selected);
            }, 
            layerTransFunction: function(range) {
                self.setOpacity("inundation2", range/100.0);
            }, 
            layerHelpFunction: function(evt) {
                if(!self._glossaryFunction) return;
                evt.stopPropagation();
                self._glossaryFunction("inundation", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
            }
        }));
        
        legend.addItem("inundation", extend(baseOptions, {
            index: 2, 
            label: "Depth of Flooding", 
            symbol: "poly", 
            multi: 7, 
            fill: ["#98edf0", "#80c7e0", "#68a1d0", "#507bc0", "#3855b0", "#202fa0", "#090991"], 
            sublabels: ["0 - 2 feet", "2 - 4 feet", "4 - 6 feet", "6 - 8 feet", "8 - 10 feet", "10 - 12 feet", "12+ feet"], 
            layerVisFunction: function(selected) {
                self.setVisible("inundation", selected);
            }, 
            layerTransFunction: function(range) {
                self.setOpacity("inundation", range/100.0);
            }, 
            layerHelpFunction: function(evt) {
                if(!self._glossaryFunction) return;
                evt.stopPropagation();
                self._glossaryFunction("inundation", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
            }
        }));
        legend.container.find("#slr-legend-main-inundation").append(
            $("<div>", {'class': "slr-legend-item-row slr-legend-item-added-info"}).html(
                "Areas outside of sea level rise and storm surge flooding extent may be subject to riverine flooding, rainfall runoff events, or other flooding hazards. "
            ).append(
                $("<a>", {target: "_blank", href: "/about/a-limitations", html: "Learn More."})
            )
        );
        legend.addItem("overtopping", extend(baseOptions, {
            index: 3, 
            label: "Shoreline Overtopping", 
            symbol: "line", 
            multi: 2, 
            fill: null, 
            stroke: ["#FA3411", "#B2B2B2"], 
            strokeWidth: 4, 
            sublabels: ["Overtopping", "No Overtopping"], 
            layerVisFunction: function(selected) {
                self.setVisible("overtopping", selected);
            }, 
            layerTransFunction: function(range) {
                self.setOpacity("overtopping", range/100.0);
            }, 
            layerHelpFunction: function(evt) {
                if(!self._glossaryFunction) return;
                evt.stopPropagation();
                self._glossaryFunction("overtopping", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
            }
        }));
        legend.addItem("lowlying", extend(baseOptions, {
            index: 4, 
            label: "Low-lying Areas", 
            symbol: "hatch", 
            fill: "#50DC0C", 
            stroke: "#50DC0C", 
            strokeWidth: 2, 
            sublabels: "Low-lying Area", 
            layerVisFunction: function(selected) {
                self.setVisible("lowlying", selected);
            }, 
            layerTransFunction: function(range) {
                self.setOpacity("lowlying", range/100.0);
            }, 
            layerHelpFunction: function(evt) {
                if(!self._glossaryFunction) return;
                evt.stopPropagation();
                self._glossaryFunction("lowlying", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
            }
        }));
        legend.addItem("counties", extend(baseOptions, {
            index: 5, 
            multi: 2, 
            label: "San Francisco Bay Counties", 
            sublabels: ["Counties", "Selected County"], 
            symbol: "poly", 
            fill: null, 
            stroke: ["#aaa", "#D4FF6E"], 
            strokeWidth: 2, 
            layerVisFunction: function(selected) {
                self.setVisible("counties", selected);
            }
        }));
        legend.addItem("legaldelta", extend(baseOptions, {
            index: 6, 
            label: "Legal Delta", 
            sublabels: "Legal Delta", 
            symbol: "poly", 
            fill: null, 
            stroke: "#222", 
            strokeWidth: 2, 
            layerVisFunction: function(selected) {
                self.setVisible("legaldelta", selected);
            }, 
            layerHelpFunction: function(evt) {
                if(!self._glossaryFunction) return;
                evt.stopPropagation();
                self._glossaryFunction("legaldelta", common.isModalOpen() && document.querySelector("#slr-modal-legend"));
            }
        }));
        
        if(onComplete) onComplete();
    };
    
    return SLRLayers;
    
});
