define([
    "jquery", 
    "d3", 
    "OpenLayers", 
    "modals", 
    "modules/upload-geo-data"
], function(
    jQuery, 
    d3, 
    ol, 
    modals, 
    UploadGeoData
) {
    
    function UDAHandler(mapHandler) {
        this.mapHandler = mapHandler;
        this.udaColor   = "#f0f";
        this.udaSource  = null;
        this.udaLayer   = null;
        this._onChange  = null;
    };
    
    UDAHandler.prototype.init = function(onComplete) {
        this.udaSource = new ol.source.Vector();
        this.udaLayer  = new ol.layer.Vector({
            source: this.udaSource, 
            style: new ol.style.Style({
                fill: null, 
                stroke: new ol.style.Stroke({
                    color: this.udaColor, 
                    width: 2
                }), 
                image: new ol.style.Circle({
                    radius: 4,
                    fill: new ol.style.Fill({color: this.udaColor}),
                    stroke: new ol.style.Stroke({color: '#fff', width: 1})
                })
            })
        });
        this.mapHandler.olMap.addLayer(this.udaLayer);
        if(onComplete) onComplete();
        onComplete = null;
    };
    
    UDAHandler.prototype.onChange = function(callback) {
        this._onChange = callback;
    };
    
    UDAHandler.prototype.hasFeatures = function() {
        return this.udaSource.getFeatures.length > 0;
    };
    
    UDAHandler.prototype.getFeaturesWkt = function() {
        var feats = this.udaSource.getFeatures();
        if(!feats.length) return null;
        return (new ol.format.WKT()).writeFeatures(feats);
    };
    
    UDAHandler.prototype.clearUda = function() {
        this.udaSource.clear(true);
        if(this._onChange) this._onChange();
    };
    
    UDAHandler.prototype.setUdaOpacity = function(opacity) {
        this.udaLayer.setOpacity(opacity);
    };
    
    UDAHandler.prototype.openUploadModal = function(onUpload) {
        var self = this;
        modals.open("uda", {url: "partials/slr-tools/upload.html"}, function() {
            new UploadGeoData(
                $("#slr-modal-upload #slr-upload-form"), 
                $("#slr-modal-upload .out-messages"), 
                function(kml) {
                    try {
                        self.setUdaFromKml(kml, onUpload);
                        modals.close();
                    } catch(e) {
                        modals.error("Upload Error", "There was an error processing the file.");
                        console.error(e);
                    }
                }
            );
        });
    };
    
    UDAHandler.prototype.setUdaFromKml = function(kml, onComplete) {
        if(!kml) return;
        // get features (always read as WG84 and convert to webmercator)
        this.__setUda(
            (new ol.format.KML()).readFeatures(kml, {
                    dataProjection: new ol.proj.Projection({code: "EPSG:4326"}), 
                    featureProjection: new ol.proj.Projection({code: "EPSG:3857"})
                }
            ), 
            onComplete
        );
    };
    
    UDAHandler.prototype.setUdaFromWkt = function(wkt, onComplete) {
        if(!wkt) return;
        this.__setUda(
            (new ol.format.WKT()).readFeatures(wkt), 
            onComplete
        );
    };
    
    UDAHandler.prototype.__setUda = function(feats, onComplete) {
        if(feats.length === 0) {
            throw "No valid features found";
        } else {
            // remove z-coordinates because OpenLayers will behave very wierdly with them
            var updateCoords = function(coords) {
                if(!$.isArray(coords[0])) {
                    while(coords.length > 2) {
                        coords.pop();
                    }
                    return;
                }
                for(var i = 0; i < coords.length; ++i) {
                    updateCoords(coords[i]);
                }
            };
            var geomType = feats[0].getGeometry().getType(), 
                realGeomType = null;
            for(var f = 0; f < feats.length; ++f) {
                // remove any default styles
                feats[f].setStyle(null);
                var geom = feats[f].getGeometry();
                if(!geom) continue;
                if(geomType === "GeometryCollection") {
                    // if geometry collection, get actual feature type by diving in
                    if(!realGeomType) {
                        realGeomType = geom.getGeometries()[0].getType();
                    }
                    var geoms = geom.getGeometries();
                    for(var g = 0; g < geoms.length; ++g) {
                        var coords = geoms[g].getCoordinates();
                        updateCoords(coords);
                        geoms[g].setCoordinates(coords);
                    }
                } else {
                    var coords = geom.getCoordinates();
                    updateCoords(coords);
                    geom.setCoordinates(coords);
                }
            }
            if(realGeomType) geomType = realGeomType;
            
            // set UDA layer
            this.udaSource.clear(true);
            this.udaSource.addFeatures(feats);
            // I really think the file is corrupt but specific fix here for a reported bug. Removes features 
            // with geometry that somehow becomes null *after* adding to udaSource
            feats = this.udaSource.getFeatures();
            for(var f = 0; f < feats.length; ++f) {
                if(!feats[f].getGeometry()) {
                    this.udaSource.removeFeature(feats[f]);
                }
            }
            
            if(onComplete) onComplete(geomType);
        }
        if(this._onChange) this._onChange();
    };
    
    return UDAHandler;
    
});