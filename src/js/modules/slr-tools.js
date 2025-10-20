
define([
    'modals', 
    'site-element', 
    'modules/geolocator', 
    'OpenLayers'
], function(
    modals, 
    SiteElement, 
    Geolocator, 
    ol
) {
    
    function SLRTools(config) {
        this.feedbackUrl    = config.urls.feedback;
        this.getInvolvedUrl = config.urls.getInvolved;
        
        this.elements = (function() {
            var elements = {
                // geolocator
                geolocator:       "#slr-geolocate-input", 
                geolocatorSubmit: "#slr-geolocate-submit"
            };
            for(var e in elements) { elements[e] = new SiteElement(elements[e]); };
            return elements;
        })();
        this.modalElems = (function() {
            var elements = {
                // geolocator
                geolocator:       "#modal-slr-geolocator", 
                geolocatorInput:  "#modal-slr-geolocator-input", 
                geolocatorSubmit: "#modal-slr-geolocator-submit", 
                //basemap select
                basemap:          "#modal-slr-basemap", 
                basemapSelect:    "#modal-slr-basemap-select"
            };
            for(var e in elements) { elements[e] = new SiteElement(elements[e]); };
            return elements;
        })();
        this.modalHtmls = {
            help:       "partials/slr-splash.html", 
            geolocator: "partials/slr-tools/geolocator.html", 
            legend  :   "partials/slr-tools/legend.html", 
            scenarios:  "partials/slr-tools/scenarios.html", 
            basemaps:   "partials/slr-tools/basemaps.html", 
            more:       "partials/slr-tools/more.html"
        };
        this.geolocator = new Geolocator(config.googleApiKey);
        this.onGeolocatorError = null;
    }
    
    SLRTools.prototype.exit = function() {
        
    };
    
    SLRTools.prototype.init = function(params) {
        var self = this;
        
        // zoom functionalities
        params.view.$menuButtons.zoomIn.on('click', function() { params.mapHandler.zoomIn(); });
        params.view.$menuButtons.zoomOut.on('click', function() { params.mapHandler.zoomOut(); });
        
        // geolocator
        this.elements.geolocator.asJQuery().keypress(function(evt) {
            if(evt.which === 13) {
                self._geolocate(this, params.mapHandler);
                evt.preventDefault();
            }
        });
        this.elements.geolocatorSubmit.asJQuery().on("click", function() {
            self._geolocate(self.elements.geolocator.asElementSingle(), params.mapHandler);
        });
        this.onGeolocatorError = function(msg, wasModal) {
            var modalContent = modals.openError("Geolocation Error", msg);
            if(wasModal) {
                $("<div>", {
                    'class': "btn slr-modal-btn return-to-geolocate", 
                    'html': "Return to Geolocate Tool"
                }).appendTo(modalContent)
                    .on('click', function(evt) {
                        self.openGeolocateModal(params.mapHandler);
                        if(evt && evt.stopPropagation) evt.stopPropagation();
                    });
            }
        };
        
        // legend
        params.view.$menuButtons.legend.on('click',function() {
            self.open("legend", params.render.mobileLegend, true);
        });
        
        // flooding scenarios
        params.view.$menuButtons.scenarios.on('click', function(slr) {
            self.open("scenarios", params.render.mobileScenarios, true);
        });
        
        // user-defined-area
        params.view.$menuButtons.uda.on('click', function() {
            params.uda.openUploadModal(function(geomType) {
                params.udaLegendItem.update(geomType);
            });
        });
        
        // help
        params.view.$menuButtons.help.on('click', params.helpCallback);
        
        // misc tools (note, binding will set event in 'mobileView' param, so those default as mobile)
        params.view.$menuButtons.geolocation.on('click', this.geolocation.bind(this, params.mapHandler));
        params.view.$menuButtons.geolocator.on('click', this.openGeolocateModal.bind(this, params.mapHandler));
        params.view.$menuButtons.basemaps.on('click', this.open.bind(this, "basemaps", self._initBasemapSelect.bind(this, params.mapHandler)));
        
        // printing
        params.view.$menuButtons.print.on('click', params.printCallback);
        
        // feedback
        params.view.$menuButtons.feedback.on('click', function() { window.open(self.feedbackUrl, "_blank");});
        
        // get involved
        params.view.$menuButtons.getInvolved.on('click', function() { window.open(self.getInvolvedUrl, "_blank");});
        
        // more button for mobile
        params.view.$menuButtons.more.on(
            'click', 
            this.open.bind(
                this, 
                "more", 
                this.openMoreMenu.bind(
                    this, 
                    params.mapHandler, 
                    params.helpCallback
                )
            )
        );
        
        if(params.onComplete) params.onComplete();
    };
    
    SLRTools.prototype.open = function(modal, onComplete, mobileView) {
        if(mobileView) {
            modals.open(modal, {url: this.modalHtmls[modal], id: "slr-modal-mobile"}, onComplete);
        } else {
            modals.open(modal, {url: this.modalHtmls[modal]}, onComplete);
        }
    };
    
    SLRTools.prototype.openMoreMenu = function(mapHandler, helpCallback) {
        var self = this;
        this.open("more", function(modalElem) {
            // disclaimer
            modalElem.find(".more-menu-item").on('click', function(evt) {
                evt.stopPropagation();
                switch(this.getAttribute("value")) {
                    case "help":
                        helpCallback();
                        break;
                    case "feedback":
                        window.open(self.feedbackUrl, "_blank");
                        break;
                    case "getinvolved":
                        window.open(self.getInvolvedUrl, "_blank");
                        break;
                }
            });
        });
    };
    
    SLRTools.prototype.openGeolocateModal = function(mapHandler) {
        var self = this;
        this.open(
            "geolocator", 
            function() {
                self.modalElems.geolocatorInput.asJQuery().keypress(function(evt) {
                    if(evt.which === 13) {
                        self._geolocate(this, mapHandler, true);
                        evt.preventDefault();
                    }
                });
                self.modalElems.geolocatorSubmit.asJQuery().on('click', function(evt) {
                    self._geolocate(
                        self.modalElems.geolocatorInput.asElementSingle(), 
                        mapHandler, 
                        true
                    );
                    evt.preventDefault();
                });
            }, 
            true
        );
    };
    
    SLRTools.prototype._geolocate = function(input, olMap, wasModal) {
        input = $(input);
        this.geolocate(input.val(), olMap, wasModal);
        input.val("");
    };
    
    SLRTools.prototype.geolocate = function(address, mapHandler, wasModal) {
        var self = this;
        this.geolocator.locate(
            address, 
            function(result) {
                if(result) {
                    mapHandler.olMap.getView().fit(result.extent);
                    mapHandler.showMarker(result.location);
                    modals.close();
                } else {
                    self.onGeolocatorError(
                        (
                            "Could not determine the location given, or location was matched outside area of interest.<br /><br />" + 
                            "Try again with more specific location query."
                        ), 
                        wasModal
                    );
                }
            }, 
            function(jqXHR, textStatus, errorThrown) {
                self.onGeolocatorError(
                    "The location service resulted in an error. Please try again later.", 
                    wasModal
                );
                console.debug(textStatus + ": " + errorThrown);
            }, 
            function(result) {
                return mapHandler.checkWithinExtent(result.location);
            }
        );
    };
    
    SLRTools.prototype.geolocation = function(mapHandler) {
        if(!"geolocation" in navigator) {
            this.onGeolocationError("Geolocation service is not available on your device and/or browser.");
            return;
        }
        var self = this;
        navigator.geolocation.getCurrentPosition(
            function(pos) {
                if(!pos || !pos.coords) {
                    self.onGeolocationError("Could not determine your current location.");
                    console.error(pos);
                    return;
                }
                var coords = ol.proj.fromLonLat([pos.coords.longitude, pos.coords.latitude]), 
                    view = mapHandler.olMap.getView();
                mapHandler.showMarker(coords);
                view.setCenter(coords);
                view.setZoom(17);
            }, 
            function(posError) {
                self.onGeolocationError("Could not determine your current location.");
                console.error(posError);
            }
        );
    };
    
    SLRTools.prototype.onGeolocationError = function(msg) {
        var modalContent = modals.openError("Geolocation Error", msg || "Geolocation service encountered an error.");
        $("<div>", {
                'class': "btn slr-modal-btn", 
                'html': "Close"
            })
            .appendTo(modalContent)
            .on('click', function(evt) { modals.close();});
    };
    
    SLRTools.prototype._initBasemapSelect = function(mapHandler) {
        var container = this.modalElems.basemapSelect.asJQuery(), 
            baseLayers = mapHandler.basemapModule.baseLayers;
        for(var i = 0; i < baseLayers.length; i++) {
            var select = $("<div>", {
                'class': 'slr-basemap-select btn2', 
                'value': i
            }).html(baseLayers[i].name).appendTo(container);
            if(baseLayers[i].layers.base.getVisible()) {
                select.addClass("selected");
            }
        }
        // form change listeners
        container.find('.slr-basemap-select').on("click", function() {
            container.find('.slr-basemap-select.selected').removeClass("selected");
            this.classList.add("selected");
            mapHandler.basemapModule.changeBasemap(
                parseInt(this.getAttribute("value")), 
                false, 
                !mapHandler.basemapModule.drawReferenceLayer
            );
            // hard-coded memory thing
            window.slrm_basemap_adjusted = true;
        });
    };
    
    return SLRTools;
    
});
