//************************************************************************************************************
// Map Handler (module)
//   -Handles map functionality.
//   -Biggest feature is ability to handle multiple click/hover functionalities on the map. This is mostly 
//    based on filtering layers by a 'type' attribute. Thus, for all added features, ensure a 'type' attribute
//    is added that is unique to it's grouping (usually same type for all features in same layer, but type is 
//    unique between layers).
//************************************************************************************************************

define([
    "OpenLayers", 
    "common", 
    "modules/basemap", 
    "modules/overlays"
], function(ol, common, Basemap, Overlays) {
    
    /**
     * Constructor for MapHandler.
     * @param {string} mapContainer - Selector for map container.
     * @param {Object} mapServerUrls - Literal of mapserver urls needed for overlays.
     * @param {jQuery} [attributionElem] - Optional, attribution element as jQuery object.
     * @param {Object} [mapOptions]
     * @param {number} [mapOptions.initZoomLevel=7] - Optional, init zoom level.
     * @param {number} [mapOptions.baseMapSelect=0] - Optional base map index (from array is baselayers.js).
     * @param {number[]} [mapOptions.center=[-120, 37.5]] - Optional, init map center.
     * @returns {MapHandler}
     */
    function MapHandler(mapContainer, mapServerUrls, attributionElem, mapOptions) {
        // variables from parameters
        this.mapContainer         = $(mapContainer);
        // hard-coded parameters
        this.mapViewId            = "slr-map-view";
        this.tooltipId            = "slr-tooltip";
        this.mapControlsId        = "slr-map-controls";
        this.popupIdPrefix        = "slr-popup";
        this.projWebMercator      = 'EPSG:3857',  // web mercator wgs84
        this.projWgs84            = 'EPSG:4326';  // assumed coordinate-system for any incoming data
        // parameters to be filled in later at mapInit() or elsewhere before init is completed
        this.olMap                = null;
        this.olZoomControl        = null;
        this.mapViewElem          = null;
        this.mapControlElem       = null;
        this.resetViewCenter      = null;
        this.resetViewExtent      = null;
        this.resetViewZoom        = null;
        this.resetViewMinMaxZoom  = null;
        this.tooltipElem          = null;
        this.popupOverlay         = null;
        this.hoverInteractions    = {};
        this.clickInteractions    = {};
        // dictionary of attached listenered
        this._olMapListeners      = [];
        // This is a weird, double-map. 'layers' maps to 'map' as a simple, paired index. Map has an array of 
        // type names, which match to the dictionary/literal 'interactions'.
        this.wmsClickInteractions = {
                                        layers: [], 
                                        map: [], 
                                        interactions: {}
                                    };
        this.wmsRequestProxy      = null;
        this.overviewMap          = null;
        this.markerFeature        = null;
        this.markerLayer          = null;
        
        // init map element
        if(!mapOptions)               { mapOptions = {}; }
        if(!mapOptions.basemapSelect) { mapOptions.basemapSelect = 0; }
        if(!mapOptions.initZoomLevel) { mapOptions.initZoomLevel = 7; }
        if(!mapOptions.minMaxZoom)    { mapOptions.minMaxZoom = [6, 14]; }
        if(!mapOptions.center)        { mapOptions.center = [-120, 37.5]; }
        if(!mapOptions.extent)        { mapOptions.extent = [-124, 32.5, -114, 43]; }

        // save view settings in case of reset
        this.resetViewCenter = ol.proj.fromLonLat(mapOptions.center, this.projWebMercator);
        this.resetViewExtent = ol.proj.transformExtent(mapOptions.extent, this.projWgs84, this.projWebMercator);
        this.resetViewZoom = mapOptions.initZoomLevel;
        this.resetViewMinMaxZoom = mapOptions.minMaxZoom;
        
        // create actual map div
        this.mapViewElem = $("<div>", {id: this.mapViewId}).prependTo(this.mapContainer);
        // create map and view (take off default zoom control, we'll place manually later)
        this.olMap = new ol.Map({ target: this.mapViewId, controls: [] });
        this.setMapView();
        
        // grabbing cursor functionality since it's not default to open layers 3
        common.addGrabCursorFunctionality(this.mapViewElem);
        
        // sub-modules
        this.basemapModule  = new Basemap(this, null, mapOptions.basemapSelect);
        this.overlaysModule = new Overlays(this, mapServerUrls);
        
        // add custom attribution
        if(attributionElem) {
            this.basemapModule.setAttributionElement(attributionElem);
        }
        
        this.initInteractions();
    };
    
    /**
     * Adds hover/click functionalities and tooltip. Do not need to directly call, called through 
     * initialization.
     */
    MapHandler.prototype.initInteractions = function() {
        // create ids for popup
        var idContainer = this.popupIdPrefix+"-container";
        var idCloser    = this.popupIdPrefix+"-closer";
        var idContent   = this.popupIdPrefix+"-content";
        
        // create popup container and overlay
        var self = this;
        var popupContainer = $("<div>", {id: idContainer}).appendTo(this.mapViewElem);
        this.popupOverlay = new ol.Overlay({
            element: document.getElementById(idContainer),
            autoPan: true,
            autoPanAnimation: { duration: 250 }
        });
        this.olMap.addOverlay(this.popupOverlay);
        // add closer 'X' to popup container
        $("<a>", {id: idCloser, href: '#'}).appendTo(popupContainer)
            .html("&#10006;")
            .on('click', function(evt) {
                evt.preventDefault();
                self.popupOverlay.setPosition(undefined);
                this.blur();
            });
        this.popupElem = $("<div>", {id: idContent}).appendTo(popupContainer);
        
        // create tooltip element
        this.tooltipElem = $("<div>", {id: this.tooltipId, style: "position:absolute"})
            .appendTo(this.mapViewElem)
            .hide();
        
        // listener on mousemove (for hover and pointer on clickable features)
        this.mapViewElem.on("mousemove", function(evt) {
            var pixel = self.olMap.getEventPixel(evt.originalEvent), 
                matchedFeature = null, 
                matchedInteraction = null, 
                clickable = false;
            self.olMap.forEachFeatureAtPixel(
                pixel,
                function(feature) {
                    var ftypes = self.getFeatureTypes(feature);
                    if(!ftypes || !ftypes.length) return;
                    // for general hover interactions
                    if(!matchedFeature) {
                        for(var i = 0; i < ftypes.length; i++) {
                            if(ftypes[i] in self.hoverInteractions) {
                                matchedFeature = feature;
                                matchedInteraction = self.hoverInteractions[ftypes[i]];
                                break;
                            }
                        }
                    }
                    // for hover pointer
                    if(!clickable) {
                        for(var i = 0; i < ftypes.length; i++) {
                            if(ftypes[i] in self.clickInteractions) {
                                clickable = true;
                                break;
                            }
                        }
                    }
                    if(matchedFeature && clickable) {
                        return true;
                    }
                }
            );
            // clickable element, hover pointer
            if(clickable) {
                self.mapViewElem.css("cursor", "pointer");
            } else {
                self.mapViewElem.css("cursor", "");
            }
            // execute hoverable functionality
            if(matchedFeature && matchedInteraction && matchedInteraction.tooltip) {
                self.tooltipElem
                    .html(matchedInteraction.tooltip(matchedFeature))
                    .css({top: pixel[1]-10, left: pixel[0]+15})
                    .show();
            } else {
                self.tooltipElem.hide();
            }
        });
        
        // listener on click
        var olMapClickListener = function(evt) {
            // match by clicked feature in vector layers
            var pixel = self.olMap.getEventPixel(evt.originalEvent), 
                matchedFeature = null, 
                matchedInteraction = null;
            self.olMap.forEachFeatureAtPixel(
                pixel,
                function(feature) {
                    if(feature) {
                        var ftypes = self.getFeatureTypes(feature);
                        if(!ftypes || !ftypes.length) return;
                        for(var i = 0; i < ftypes.length; i++) {
                            if(ftypes[i] in self.clickInteractions) {
                                matchedFeature = feature;
                                matchedInteraction = self.clickInteractions[ftypes[i]];
                                return true;
                            }
                        }
                    }
                }
            );
            // after looping through features execute interaction
            // execute click function first, depending on return, executing popup function
            var coords = self.olMap.getEventCoordinate(evt.originalEvent);
            if(matchedFeature && matchedInteraction && matchedInteraction.click(matchedFeature, coords)) {
                self.openPopup(
                    coords, 
                    matchedInteraction.popup(matchedFeature, coords), 
                    matchedInteraction.onComplete
                );
            }
            // WMS click interactions
            if(!self.wmsClickInteractions.layers.length) return;
            var resolution = self.olMap.getView().getResolution(), 
                wmsRequests = [];
            for(var i = 0; i < self.wmsClickInteractions.layers.length; ++i) {
                var layer  = self.wmsClickInteractions.layers[i];
                if(!layer || !layer.getVisible()) continue;
                var source = layer.get("WmsClickAlias") || layer.getSource(), 
                    params = source.getParams();
                if(!params.layers) continue;
                // push layer index and get feature request url
                wmsRequests.push([
                    i, 
                    source.getGetFeatureInfoUrl(coords, resolution, self.projWebMercator, {
                        "QUERY_LAYERS": params.layers, 
                        "INFO_FORMAT": "gml"
                    })
                ]);
            }
            if(wmsRequests.length) {
                var count = 0, 
                    responses = Array.apply(null, Array(wmsRequests.length)), 
                    // continues to __wmsInteraction() when all requests are complete
                    syncFinish = function() {
                        if(++count === wmsRequests.length) {
                            // convert responses to map by layer index
                            var responseMap = {};
                            for(var i = 0; i < responses.length; ++i) {
                                if(!responses[i]) return;
                                if(!(responses[i][0] in responseMap)) responseMap[responses[i][0]] = [];
                                responseMap[responses[i][0]].push(responses[i][1]);
                            }
                            self.__wmsInteraction(coords, responseMap);
                        }
                    };
                for(var i = 0; i < wmsRequests.length; ++i) {
                    if(!self.wmsRequestProxy) {
                        // direct request (immediately invoked function constructor cause of var scope)
                        (function(request, index) {
                            return function() {
                                $.ajax({
                                    url: request[1], 
                                    success: function(res) {
                                        responses[index] = [request[0], res];
                                    }, 
                                    complete: function() {
                                        syncFinish();
                                    }
                                });
                            };
                        })(wmsRequests[i], i)();
                    } else {
                        // proxy request
                        (function(request, index) {
                            return function() {
                                self.wmsRequestProxy(
                                    request[1], 
                                    function(res) { responses[index] = [request[0], res]; }, 
                                    function() { }, 
                                    function() { syncFinish(); }
                                );
                            };
                        })(wmsRequests[i], i)();
                    }
                }
            }
        };
        this.on("click", olMapClickListener);
        
        // marker
        this.markerFeature = new ol.Feature({
            geometry: new ol.geom.Point([0,0])
        });
        this.markerFeature.setStyle([
            new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [13, 33],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    opacity: 0.3,
                    src: 'images/marker-shadow.png'
                })
            }), 
            new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 45],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                    src: 'images/marker.png'
                })
            })
        ]);
        this.markerLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [this.markerFeature]
            })
        });
        this.markerLayer.setVisible(false);
        this.olMap.addLayer(this.markerLayer);
        this.markerLayer.setZIndex(9999);
        
        // marker disappears on click
        var olMapHideMarkerListener =  function() {
            self.hideMarker();
        };
        this.on("click", olMapHideMarkerListener);
    };
    
    MapHandler.prototype.exit = function() {
        for(var i = 0; i < this._olMapListeners.length; ++i) {
            this._un(this._olMapListeners[i][0], this._olMapListeners[i][1]);
        }
        this.olMapListeners = null;
        this.olMap.setTarget(null);
        this.olMap = null;
    };
    
    //********************************************************************************************************
    // WMS getFeatureInfo response handling
    //********************************************************************************************************
    MapHandler.prototype.__getGmlStart = function(dom) {
        if(dom.tagName === "msGMLOutput") return dom;
        var children = dom.children || dom.childNodes;
        if(!children) return null;
        for(var i = 0; i < children.length; ++i) {
            var gml = this.__getGmlStart(children[i]);
            if(gml) return gml;
        }
    };
    
    MapHandler.prototype.__serializeGmlNode = function(gml, obj, first) {
        var children = gml.children || gml.childNodes;
        if(typeof gml.tagName === "undefined") return;
                               // I hate IE
        if(!children.length || (children.length === 1 && typeof children[0].tagName === "undefined")) {
            obj[gml.tagName] = gml.innerHTML || gml.textContent;
            return;
        }
        var subObj = obj;
        if(!first) {
            obj[gml.tagName] = subObj = {};
        }
        for(var i = 0; i < children.length; i++) {
            this.__serializeGmlNode(children[i], subObj, false);
        }
        return obj;
    };
    
    MapHandler.prototype.__wmsInteraction = function(coords, responseMap) {
        if(!responseMap) return;
        // to be map of interaction type to array of feat data
        var acceptedInteractions = {};
        // iterate through response map
        for(var layerIndex in responseMap) {
            for(var i = 0; i < responseMap[layerIndex].length; ++i) {
                var xml = (new DOMParser()).parseFromString(responseMap[layerIndex][i], "text/xml"), 
                    gml = this.__getGmlStart(xml);
                if(!gml) continue;
                // for each response check for feature data
                var features = [],
                    children = gml.children || gml.childNodes;
                for(var t = 0; t < children.length; ++t) {
                    var gmlLayer = children[t];
                    if(typeof gmlLayer.tagName === "undefined" || !gmlLayer.tagName.endsWith("_layer")) continue;
                    var layerChildren = gmlLayer.children || gmlLayer.childNodes;
                    for(var j = 0; j < layerChildren.length; ++j) {
                        if(typeof layerChildren[j].tagName === "undefined" || !layerChildren[j].tagName.endsWith("_feature")) continue;
                        features.push(this.__serializeGmlNode(layerChildren[j], {}, true));
                    }
                }
                if(!features.length) continue;
                // loop through wms interactions
                for(var t = 0; t < this.wmsClickInteractions.map[layerIndex].length; ++t) {
                    var type = this.wmsClickInteractions.map[layerIndex][t];
                    // loop through features
                    for(var f = 0; f < features.length; ++f) {
                        // check validation function
                        if(this.wmsClickInteractions.interactions[type].click(features[f])) {
                            // append layer name info
                            features[f]["_layer"] = this.wmsClickInteractions.layers[layerIndex];
                            // add type and feat data to map
                            if(!(type in acceptedInteractions)) acceptedInteractions[type] = [];
                            acceptedInteractions[type].push(features[f]);
                        }
                   }
                }
            }
        }
        // finally iterate through accepted interactions
        for(var type in acceptedInteractions) {
            var interactions = this.wmsClickInteractions.interactions[type];
            this.openPopup(coords, interactions.popup(acceptedInteractions[type]), interactions.onComplete);
        }
    };
    
    MapHandler.prototype.setWMSRequestProxy = function(callback) {
        this.wmsRequestProxy = callback;
    };
    
    
    //********************************************************************************************************
    // Basic Map Functions and Misc Functions
    //********************************************************************************************************
    MapHandler.prototype.zoomIn = function() {
        var view = this.olMap.getView();
        view.setZoom(view.getZoom()+1);
    };
    
    MapHandler.prototype.zoomOut = function() {
        var view = this.olMap.getView();
        view.setZoom(view.getZoom()-1);
    };
    
    /**
     * Set (or reset) map view and properties of map view.
     * @param {number[]} [center] - Map center, optional, if not provided uses default from map init.
     * @param {number} [zoom] - Zoom level, optional, if not provided uses default from map init.
     * @param {number[]} [extent] - Map extent, optional, if not provided uses default from map init.
     * @param {number[]} [minMaxZoom] - Min and max zoom levels, optional, if not provided uses default from 
     *        map init.
     */
    MapHandler.prototype.setMapView = function(center, zoom, extent, minMaxZoom) {
        if(!center)      { center = this.resetViewCenter; }
        if(!zoom)        { zoom = this.resetViewZoom; }
        if(!extent)      { extent = this.resetViewExtent; }
        if(!minMaxZoom)  { minMaxZoom = this.resetViewMinMaxZoom; }
        this.olMap.setView(
            new ol.View({
                center: center,
                zoom: zoom,
                minZoom: minMaxZoom[0],
                maxZoom: minMaxZoom[1],
                extent: extent
            })
        );
    };
    
    
    MapHandler.prototype.getMapCenterCoordinates = function(evt) {
        return this.olMap.getView().getCenter();
    };
    
    
    MapHandler.prototype.getEventCoordinates = function(evt) {
        return this.olMap.getEventCoordinate(evt.originalEvent);
    };
    
    
    MapHandler.prototype.coordinatesToLonLat = function(coords) {
        return ol.proj.toLonLat(coords, this.projWebMercator);
    };
    
    
    MapHandler.prototype.coordinatesFromLonLat = function(coords) {
        return ol.proj.fromLonLat(coords, this.projWebMercator);
    };
    
    
    MapHandler.prototype.checkWithinExtent = function(coords) {
        if(coords[0] < this.resetViewExtent[0] || coords[0] > this.resetViewExtent[2]) return false;
        if(coords[1] < this.resetViewExtent[1] || coords[1] > this.resetViewExtent[3]) return false;
        return true;
    };
    
    
    //********************************************************************************************************
    // Specific event listeners
    //********************************************************************************************************
    MapHandler.prototype.on = function(type, listener) {
        this._olMapListeners.push([type, listener]);
        var listenOn = type.split(":")[0];
        if(listenOn === "view") {
            this.olMap.getView().on(type.split(":")[1], listener);
        } else if(listenOn === "basemap") {
            this.basemapModule.onChange(listener);
        } else {
            this.olMap.on(type, listener);
        }
    };
    
    MapHandler.prototype.un = function(type, listener) {
        for(var i = 0; i < this._olMapListeners.length; ++i) {
            if(type === this._olMapListeners[i][0] && listener === this._olMapListeners[i][1]) {
                var remove = this._olMapListeners.splice(i, 1)[0];
                this._unt(remove[0], remove[1]);
                break;
            }
        }
    };
    
    MapHandler.prototype._un = function(type, listener) {
        if(type.split(":")[0] === "view") {
            this.olMap.getView().un(type.split(":")[1], listener);
        } else {
            this.olMap.un(type, listener);
        }
    };
    
    
    //********************************************************************************************************
    // Functions needed for interactions
    //********************************************************************************************************
    MapHandler.prototype.addTypeToLayers = function(layers, type) {
        if(!$.isArray(layers)) { layers = [layers]; }
        for(var l = 0; l < layers.length; l++) {
            var source = layers[l].getSource(),
                features;
            if(source instanceof ol.source.Cluster) {
                // clusters are weird as they're a source within a source
                features = source.getSource().getFeatures();
            } else if(source instanceof ol.source.Vector) {
                features = source.getFeatures();
            } else {
                // do nothing, no features in non-vector type
                continue;
            }
            for(var f = 0; f < features.length; f++) {
                this.addTypeToFeature(features[f], type);
            }
        }
    };
    
    MapHandler.prototype.removeTypeFromLayers = function(layers, type) {
        if(!$.isArray(layers)) { layers = [layers]; }
        for(var l = 0; l < layers.length; l++) {
            var source = layers[l].getSource(), 
                features;
            if(source instanceof ol.source.Cluster) {
                // clusters are weird as they're a source within a source
                features = source.getSource().getFeatures();
            } else if(source instanceof ol.source.Vector) {
                features = source.getFeatures();
            } else {
                // do nothing, no features in non-vector type
                continue;
            }
            for(var f = 0; f < features.length; f++) {
                this.removeTypeFromFeature(features[f], type);
            }
        }
    };
    
    
    MapHandler.prototype.addTypeToFeature = function(feature, type) {
        var types = feature.get("mh-types");
        types = !types ? [] : $.isArray(types) ? types : [types];
        if(types.indexOf(type) >= 0) return;
        types.push(type);
        feature.set("mh-types", types);
    };
    
    
    MapHandler.prototype.removeTypeFromFeature = function(feature, type) {
        var types = feature.get("mh-types");
        if(!types) return;
        var index = types.indexOf(type);
        if(index < 0) return;
        feature.set("mh-types", types.splice(index, 1));
    };
    
    
    MapHandler.prototype.getFeatureTypes = function(feature) {
        if(!feature) { return null; }
        if(feature.get("features")) {
            // clustered features
            return feature.get("features")[0].get("mh-types");
        } else {
            // regular features
            return feature.get("mh-types");
        }
    };
    
    
    MapHandler.prototype.featureHasType = function(feature, type) {
        return this.getFeatureTypes(feature).indexOf(type) >= 0;
    };
    
    
    //********************************************************************************************************
    // Hover/Tooltip Functionality
    //********************************************************************************************************
    /**
     * Adds hover functionalities for a given type and layer(s).
     * @param {string} type - Value in 'type' attribute of features for which these interactions apply.
     * @param {ol.layer|ol.layer[]} layers- Either singular or array of OpenLayers layer objects to apply 
     *        style function. Required for style function.
     * @param {callback} tooltipFunc - Callback function for filling the tooltip. Passes the feature being 
     *        hovered as a parameter.
     * @param {callback} styleFunc - Callback function hover style. Passes the feature being hovered as a 
     *        parameter.
     * @param {callback} hoverFunc - Callback function just generally called on hover. Passes the feature 
     *        being hovered as a parameter.
     * @returns {Object} Literal of interactions being replaced, if they exist. Keys are 'interaction', 
     *        'tooltip', and 'hover'.
     */
    MapHandler.prototype.addHoverFunctionality = function(type, layers, tooltipFunc, styleFunc, hoverFunc) {
        var oldInteractions = this.removeHoverFunctionality(type);
        var newInteractions = {
            interaction: null, 
            tooltip: tooltipFunc, 
            hover: hoverFunc
        };
        if(layers) {
            if(!$.isArray(layers)) { layers = [layers]; }
            // enforce vector layer (or cluster)
            for(var i = 0; i < layers.length; ++i) {
                if(!(layers[i].getSource() instanceof ol.source.Vector) && !(layers[i].getSource() instanceof ol.source.Cluster)) {
                    throw "Applying hover functionality to non-vector/cluster type layer.";
                }
            }
            // add type
            this.addTypeToLayers(layers, type);
            // create and add interactions
            if(styleFunc !== undefined) {
                newInteractions.interaction = new ol.interaction.Select({
                    condition: ol.events.condition.pointerMove, 
                    layers: layers, 
                    style: styleFunc
                });
                this.olMap.addInteraction(newInteractions.interaction);
            }
            if(hoverFunc) {
                newInteractions.interaction.on("select", function(evt) {
                    hoverFunc(evt.selected);
                });
            }
        }
        this.hoverInteractions[type] = newInteractions;
        return oldInteractions;
    };
    
    /**
     * Remove hover functionalities for a given type.
     * @param {type} type - Value in 'type' attribute of features for which these interactions apply.
     * @returns {Object} Literal of interactions being removed, if they exist. Keys are 'interaction', 
     *        'tooltip', and 'hover'.
     */
    MapHandler.prototype.removeHoverFunctionality = function(type) {
        if(!(type in this.hoverInteractions)) {
            return null;
        }
        var oldInteractions = this.hoverInteractions[type];
        if(oldInteractions.interaction) {
            this.olMap.removeInteraction(oldInteractions.interaction);
        }
        delete this.hoverInteractions[type];
        return oldInteractions;
    };
    
    
    //********************************************************************************************************
    // Click/Popup Functionality
    //********************************************************************************************************
    MapHandler.prototype.openPopup = function(coordinates, contentHtml, onComplete) {
        this.popupOverlay.setPosition(coordinates);
        this.popupElem.html(contentHtml);
        if(onComplete) onComplete(this.popupElem);
    };
    
    /**
     * Close popup element, if open.
     */
    MapHandler.prototype.closePopup = function() {
        this.popupOverlay.setPosition(undefined);
        this.popupElem.blur();
    };
    
    /**
     * Add click functionalities for given type.
     * @param {string} type - Value in 'type' attribute of features for which these interactions apply.
     * @param {ol.layer|ol.layer[]} layers- Either singular or array of OpenLayers layer objects to apply 
     *        functionality to.
     * @param {callback} clickFunc - Callback function just generally called on click. Passes the feature 
     *        being clicked as a parameter. Must return a boolean. This is called first, and if the return is 
     *        true, continue to open the popup. If false, popup is skipped.
     * @param {callback} popupFunc - Callback function for content of popup. Passes the feature being clicked 
     *        as a parameter. Must return a boolean. If clickFunc (which is called first) returns false 
     *        however, this will be skipped.
     * @param {callback} popupOnComplete - Callback function to run once popup is completed. Useful if 
     *        requiring for functionality to be enabled on popup content. Pass jQuery element of popup box as 
     *        parameter.
     * @returns {Object} Literal of interactions being replaced, if they exist. Keys are 'click' and 'popup'.
     */
    MapHandler.prototype.addClickFunctionality = function(type, layers, clickFunc, popupFunc, popupOnComplete) {
        if(!$.isArray(layers)) layers = [layers];
        // enforce vector or cluster type
        for(var i = 0; i < layers.length; ++i) {
            if(!(layers[i].getSource() instanceof ol.source.Vector) && !(layers[i].getSource() instanceof ol.source.Cluster)) {
                throw "Click functionality only supported for vector or cluster layer sources (for TileWMS see addWMSClickFunctionality()).";
            }
        }
        this.addTypeToLayers(layers, type);
        var oldInteractions = this.removeClickFunctionality(type);
        this.clickInteractions[type] = {
            click: clickFunc,
            popup: popupFunc, 
            onComplete: popupOnComplete
        };
        return oldInteractions;
    };
    
    /**
     * Remove click functionalities for given type.
     * @param {string} type - Value in 'type' attribute of features for which these interactions apply.
     * @returns {Object} Literal of interactions being removed, if they exist. Keys are 'click' and 'popup'.
     */
    MapHandler.prototype.removeClickFunctionality = function(type) {
        if(!(type in this.clickInteractions)) return null;
        var oldInteraction = this.clickInteractions[type];
        this.olMap.removeInteraction(oldInteraction);
        delete this.clickInteractions[type];
        return oldInteraction;
    };
    
    /**
     * Add WMS click functionality. Note that adding is a two step process. First call this to add an 
     * interaction, then call applyWMSClickFunctionality to apply the given interaction to layers.
     * @param {string} type - Unique type name to give to this set of interactions.
     * @param {callback} clickFunc - Callback function just generally called on click. Passes the feature 
     *        being clicked as a parameter. Must return a boolean. This is called first, and if the return is 
     *        true, continue to open the popup. If false, popup is skipped.
     * @param {callback} popupFunc - Callback function for content of popup. Passes the feature being clicked 
     *        as a parameter. Must return a boolean. If clickFunc (which is called first) returns false 
     *        however, this will be skipped.
     * @param {callback} popupOnComplete - Callback function to run once popup is completed. Useful if 
     *        requiring for functionality to be enabled on popup content. Pass jQuery element of popup box as 
     *        parameter.
     * @returns {Object} Literal of interactions being replaced, if they exist. Keys are 'click' and 'popup'.
     */
    MapHandler.prototype.addWMSClickFunctionality = function(type, clickFunc, popupFunc, popupOnComplete) {
        var oldInteraction = this.wmsClickInteractions.interactions[type];
        this.wmsClickInteractions.interactions[type] = {
            click: clickFunc,
            popup: popupFunc, 
            onComplete: popupOnComplete
        };
        return oldInteraction;
    };
    
    /**
     * Apply WMS click functionality to layers. Note interaction `type` key must be created first with 
     * addWMSClickFunctionality().
     * @param {string} type - Unique type name of interactions.
     * @param {ol.layer|ol.layer[]} layers- Either singular or array of OpenLayers layer objects to apply.
     */
    MapHandler.prototype.applyWMSClickFunctionality = function(type, layers) {
        // ensure interaction exists
        if(!type in this.wmsClickInteractions.interactions) return;
        // enforce vector, cluster, or WMS
        if(!$.isArray(layers)) { layers = [layers]; }
//        for(var i = 0; i < layers.length; ++i) {
//            if(!(layers[i].getSource() instanceof ol.source.TileWMS)) {
//                throw "Applying WMS click functionality to non-TileWMS layer type.";
//            }
//        }
        for(var i = 0; i < layers.length; ++i) {
            // add or find layer index
            var index = this.wmsClickInteractions.layers.indexOf(layers[i]);
            if(index < 0) {
                this.wmsClickInteractions.layers.push(layers[i]);
                this.wmsClickInteractions.map.push([type]);
            } else {
                this.wmsClickInteractions.map[index].push(type);
            }
        }
    };
    
    /**
     * Remove click functionalities for given type.
     * @param {string} type - Unique type name of interactions to remove.
     * @param {ol.layer|ol.layer[]} layers- Either singular or array of OpenLayers layer objects to remove WMS
     *        interactions from.
     * @returns {Object} Literal of interactions being removed.
     */
    MapHandler.prototype.removeWMSClickFunctionalityType = function(type) {
        if(!type in this.wmsClickInteractions.interactions) return;
        // loop though array map backwards (this is to avoid issues with splicing
        for(var i = --this.wmsClickInteractions.map.length; i >= 0; --i) {
            // loop through types
            for(var j = 0; j < this.wmsClickInteractions.map[i].length; ++j) {
                // remove from array map on match
                if(this.wmsClickInteractions.map[i][j] === type) {
                    this.wmsClickInteractions.map[i].splice(j, 1);
                    break;
                }
            }
            // if no interactions remaining for layer, remove whole thing
            if(!this.wmsClickInteractions.map[i].length) {
                this.wmsClickInteractions.map.splice(i, 1);
                this.wmsClickInteractions.layers.splice(i, 1);
            }
        }
        // finally remove the interaction
        var oldInteraction = this.wmsClickInteractions[type];
        delete this.wmsClickInteractions[type];
        return oldInteraction;
    };
    /**
     * Remove click functionalities on given layers for given interaction type key.
     * @param {ol.layer|ol.layer[]} layers- Either singular or array of OpenLayers layer objects to remove WMS
     *        interactions from.
     * @param {string} type - Unique type name of interactions to remove. NOTE: if null or undefined, removes 
     *        all interactions.
     */
    MapHandler.prototype.removeWMSClickFunctionalityFromLayers = function(layers, type) {
        if(type !== null && type !== undefined && !type in this.wmsClickInteractions.interactions) {
            throw "Interaction type does not exist";
        }
        if(!$.isArray(layers)) { layers = [layers]; }
        for(var i = 0; i < layers.length; ++i) {
            var index = this.wmsClickInteractions.layers.indexOf(layers[i]);
            if(index < 0) continue;
            var mapIndex = this.wmsClickInteractions.map[index].indexOf(type);
            if(mapIndex < 0) continue;
            this.wmsClickInteractions.map[index].splice(mapIndex, 1);
            // if empty, remove entirely
            if(!this.wmsClickInteractions.map[index].length) {
                delete this.wmsClickInteractions.interactions[type];
                this.wmsClickInteractions.layers.splice(index, 1);
                this.wmsClickInteractions.map.splice(index, 1);
            }
        }
    };
    
    MapHandler.prototype.addAliasForTMS = function(theTmsLayer, theWmsSource) {
        theTmsLayer.set("WmsClickAlias", theWmsSource);
    };
    
    MapHandler.prototype.removeAliasForTMS = function(theTmsLayer) {
        theTmsLayer.set("WmsClickAlias", false);
    };
    
    
    //********************************************************************************************************
    // Marker Functionality
    //********************************************************************************************************
    MapHandler.prototype.showMarker = function(coords) {
        this.markerFeature.getGeometry().setCoordinates(coords);
        this.markerLayer.setVisible(true);
    };
    
    MapHandler.prototype.showMarkerOnLonLat = function(lonlat) {
        this.showMarker(ol.proj.fromLonLat(lonlat));
    };
    
    MapHandler.prototype.hideMarker = function() {
        this.markerLayer.setVisible(false);
    };
    
    
    //********************************************************************************************************
    // Overview Map Functionality
    //********************************************************************************************************
    MapHandler.prototype.showOverviewMap = function(layers, view) {
        if(!this.overviewMap) {
            var omOptions = {
                collapsed: false, 
                collapsible: false
            };
            if(layers) { omOptions.layers = layers; }
            if(view) { omOptions.view = view; }
            this.overviewMap = new ol.control.OverviewMap(omOptions);
            this.olMap.addControl(this.overviewMap);
            // add double-click to exit detailed view
            var self = this;
            $(".ol-overviewmap-map .ol-viewport").dblclick(function() {
                if(self.fhabs.isWbOpen) {
                    self.fhabs.closeWaterbody();
                }
            });
        }
    };
    
    MapHandler.prototype.hideOverviewMap = function() {
        if(this.overviewMap) {
            this.olMap.removeControl(this.overviewMap);
            this.overviewMap = null;
        }
    };
    
    
    return MapHandler;
    
});
