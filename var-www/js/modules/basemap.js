//************************************************************************************************************
// Basemap (module)
//   -Modules under the MapHandler Module.
//   -Handles basemaps, basemap changes, as well as basemap control element (which it creates).
//   -Uses input from baselayers.js for list of baselayers.
//************************************************************************************************************

define([
    "OpenLayers", 
    "baselayers"
], function(ol, defaultBaseLayers) {
    
    /**
     * 
     * @param {MapHandler} parentMapHandler - Parent FHABs application.
     * @param {Object[]} [inputBaseLayers] - Array of baselayer information. If null uses default -- see
     *        baselayers.js for format and default values.
     * @param {number} [basemapSelectIndex=0] - Index of selected basemap to initialize with.
     *        dropdown select box).
     * @returns {Basemap}
     */
    function Basemap(parentMapHandler, inputBaseLayers, basemapSelectIndex) {
        this.mapHandler = parentMapHandler;
        // for custom attribution div
        this.attributionElem = null;
        // copy input array into OL-readable format
        if(!inputBaseLayers) { inputBaseLayers = defaultBaseLayers; }
        this.baseLayers = inputBaseLayers;
        this.baseLayersArray = [];
        this.referenceLayersArray = [];
        for(var i = 0; i < this.baseLayers.length; i++) {
            this.baseLayersArray.push(this.baseLayers[i].layers.base);
            if(this.baseLayers[i].layers.reference) {
                this.referenceLayersArray.push(this.baseLayers[i].layers.reference);
            }
        }
        // add as layer group
        this.baseLayersGroup = new ol.layer.Group({
            layers: this.baseLayersArray.concat(this.referenceLayersArray)
        });
        // for handling whether to draw reference when switching basemaps
        this.drawReferenceLayer = true;
        // select the basemap in controls and hide all but the initial selected basemap
        this.changeBasemap(basemapSelectIndex);
        // add to map
        this.baseLayersGroup.setZIndex(0);
        this.mapHandler.olMap.setLayerGroup(this.baseLayersGroup);
        // change listener
        this._onChange = null;
    };
    
    Basemap.prototype.setAttributionElement = function(elem) {
        this.attributionElem = $(elem);
        this.updateAttribution();
    };
    
    Basemap.prototype.updateAttribution = function(layerIndex) {
        if(!this.attributionElem) {
            return;
        } else if(layerIndex === undefined || layerIndex === null) {
            layerIndex = this.lastLayerIndex;
        }
        if(layerIndex < 0) {
            this.attributionElem.hide();
        } else {
            var attributions = this.baseLayers[layerIndex].layers.base.getSource().getAttributions();
            if(attributions && attributions.length > 0) {
                this.attributionElem.html(attributions[0].getHTML()).show();
            } else {
                this.attributionElem.hide();
            }
        }
    };
    
    Basemap.prototype.onChange = function(callback) {
        this._onChange = callback;
    };
    
    /**
     * Change basemap using index.
     * @param {number} layerIndex - Base layer index.
     * @param {boolean} [turnOff=false] - If true, turns all baselayers off.
     * @param {boolean} [skipReference] - If true, does not load the associated reference layer. If null or 
     *        undefined, determines via the last turnOnReference() or turnOffReference() call.
     * @param {boolean} [referenceOnly=false] - If true, applied to the reference layer (e.g. some baselayers 
     *        are a combination of the image layer and a reference layer on top), if applicable.
     */
    Basemap.prototype.changeBasemap = function(layerIndex, turnOff, skipReference, referenceOnly) {
        if(turnOff) {
            layerIndex = -1;
        } else {
            layerIndex = parseInt(layerIndex);
            if(!layerIndex || layerIndex < 0 || layerIndex >= this.baseLayers.length) { 
                layerIndex = 0; 
            }
            this.lastLayerIndex = layerIndex;
        }
        skipReference = skipReference !== undefined && skipReference !== null ? skipReference : !this.drawReferenceLayer;
        referenceOnly = skipReference ? false : referenceOnly;
        for(var i = 0; i < this.baseLayers.length; i++) {
            if(!referenceOnly) {
                this.baseLayers[i].layers.base.setVisible(layerIndex === i);
            }
            if(this.baseLayers[i].layers.reference) {
                this.baseLayers[i].layers.reference.setVisible(!skipReference && layerIndex === i);
            }
        }
        if(!referenceOnly) {
            this.updateAttribution(layerIndex);
        }
        if(this._onChange) {
            this._onChange(layerIndex);
        }
    };
    
    /**
     * Turn on the last baselayer that was on.
     */
    Basemap.prototype.turnOn = function() {
        this.changeBasemap(this.lastLayerIndex);
    };
    
    /**
     * Turn off all baselayers.
     */
    Basemap.prototype.turnOff = function() {
        this.changeBasemap(-1, true);
    };
    
    /**
     * Turn on the reference layer of the last baselayer that was on.
     */
    Basemap.prototype.turnOnReference = function() {
        this.drawReferenceLayer = true;
        this.changeBasemap(this.lastLayerIndex, false, false, true);
    };
    
    /**
     * Turn off the reference layer..
     */
    Basemap.prototype.turnOffReference = function() {
        this.drawReferenceLayer = false;
        this.changeBasemap(-1, true, false, true);
    };
    
    
    return Basemap;
    
});
