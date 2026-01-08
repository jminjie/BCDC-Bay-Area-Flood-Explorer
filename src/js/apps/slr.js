/*
 * Developed by the San Francisco Estuary Institute (SFEI) for the SF Bay Conseravtion and Development 
 * Commission (BCDC).
 * @copyright 2025 San Francisco Estuary Institute (SFEI)
 * @author SFEI
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define([
    "site-element", 
    "OpenLayers", 
    "modals", 
    "apps/map-handler", 
    "modules/slr-state", 
    "modules/slr-matrix", 
    "modules/slr-view", 
    "modules/slr-slider", 
    "modules/slr-tools", 
    "modules/slr-legend", 
    "modules/slr-layers", 
    "modules/slr-click-render", 
    "modules/slr-uda-handler", 
    "modules/slr-uda-legend-item", 
    "modules/slr-tutorial"
], function(
    SiteElement, 
    ol, 
    modals, 
    MapHandler, 
    SLRState, 
    SLRMatrix, 
    SLRView, 
    SLRSlider, 
    SLRTools, 
    SLRLegend, 
    SLRLayers, 
    slrClickRender, 
    UDAHandler, 
    UDALegendItem, 
    SLRTutorial
) {
    //********************************************************************************************************
    // Constructor and init/exit functions
    //********************************************************************************************************
    function SLR(config, options) {
        var self = this;
        options = options || {};
        // elements (most of these are handled/init in slr-view, but define all selectors her)
        this.elements = (function() {
            var elements = {
                container:       "#slr-container",           // container for entire app
                mapPanel:        "#slr-map-panel",           // container for map portion
                attributions:    "#slr-panel-attributions",  // attributions at bottom legend
                mapAttribution:  "#slr-map-attributions",    // dynamic part of attributions (for basemap)
                controlPanel:    "#slr-side-panel",          // complete side panel (including top/bottom)
                cpTop:           "#slr-panel-top",           // top panel
                cpBottom:        "#slr-panel-bottom",        // bottom panel
                cpDrag:          "#slr-panel-drag",          // panel drag/resizer
                sliderPanel:     "#slr-slider-panel",        // total water level slider
                headerMenu:      "#slr-header-menu",         // menu at top-right (help, print, feedback, etc)
                menu:            "#slr-menu",                // menu attached left of panel
                menuResponsive:  "#slr-menu-responsive",     // mobile menu bar (at bottom)
                modeToggle:      "#slr-mode-toggle",         // mode toggle switch in mobile mode
                modeToggleLabel: "#slr-mode-toggle-label",   // label for toggle
                legendIntro1:    "#slr-legend-intro-1",      // legend intro for flooding mode
                legendIntro2:    "#slr-legend-intro-2",      // legend intro for consequence mode
                printMapPanel:   "#slr-print-map",           // print specific map panel
                printLegend:     "#slr-print-legend"         // print specific legend
            };
            for(var e in elements) { elements[e] = new SiteElement(elements[e]); };
            return elements;
        })();
        // config variables and internal state stuff
        this._wasInit          = false;
        this.__printMode       = !!options.forPrintLayout;
        this.slrLevels         = [0, 12, 24, 36, 48, 52, 66, 77, 84, 96, 108];  // displayable levels
        this.slrLevelsFull     = [0, 6, 12, 18, 24, 30, 36, 42, 48, 52, 54, 60, 66, 72, 77, 84, 90, 96, 102, 108];
        this.getInvolvedUrl    = config.urls.getInvolved;
        this.selectedCounty    = "no selection";  // county of focus (updates with map view)
        this.clickLayers       = {};              // map of layers for click function
        this.printLayers       = [];              // array of layer keys for print function
        config.responsiveWidth = 840;             // pixel width below which mobile mode starts
        // link site handler if provided
        this.site = options.site;
        // initialize map module here (adjust init zoom based on window size)
        config.mapOptions.initZoomLevel = config.mapOptions.initZoomLevel || 9;
        if($(window).width() > 1000) ++config.mapOptions.initZoomLevel;
        this.mapHandler = new MapHandler(
            (!this.__printMode ? this.elements.mapPanel.selector : this.elements.printMapPanel.selector), 
            config.mapServerUrls, 
            this.elements.mapAttribution.selector, 
            config.mapOptions
        );
        // initialize other modules
        this.matrix        = new SLRMatrix(this.slrLevels, this.slrLevelsFull);
        this.uda           = new UDAHandler(this.mapHandler);
        this.layers        = new SLRLayers(config);
        this.udaLegendItem = null;  // special module for UDA legend item (not init yet, done in init())
        if(this.__printMode) {
            // print mode only needs simple version of legend
            this.legend = new SLRLegend(
                this.elements.printLegend.selector, 
                this.layers, 
                "print"
            );
        } else {
            // otherwise needs legend and other modules like view, slider, tool-handler
            this.view   = new SLRView(this.elements, config);
            this.slider = new SLRSlider(this.slrLevels);
            this.tools  = new SLRTools(config);
            this.legend = new SLRLegend(
                this.view.$panelBottomContent, 
                this.layers, 
                "main", 
                // on widget swap (widget only handles consequence layers right now)
                function(selected, last) {
                    // close popups
                    self.closePopups();
                    if(selected) {
                        // error popup if selecting consequence while TWL=0
                        if(!self.state.get("slrvalue") && self.state.get("analysismode") === "consequence") {
                            modals.error(
                                "Select Total Water Level", 
                                "To view consequences, select flooding from Total Water Level slider at left."
                            );
                        }
                        // scroll to selected
                        var scrollThis = this.container.closest("#slr-legend-main").parent();
                        if(scrollThis) {
                            scrollThis.animate(
                                {scrollTop: this.container.position().top + scrollThis.scrollTop()}, 
                                200
                            );
                        }
                    }
                }
            );
        }
        // initialize state (outsourced into private function)
        this.state = new SLRState();
        this.__initState(options);
        // after this interaction setups only relevant if not print mode
        if(this.__printMode) return;
        // sync slider to state update
        this.slider.onSliderChange(function(sliderSlr) { self.updateSLR(sliderSlr); });
        // responsive UI swap listener
        this.slider._mobileMode = window.screen.width < config.responsiveWidth;
        this.view.addOnResponsiveSwap(function(isMobileView) {
            self.slider._mobileMode = isMobileView;
        });
        // to ensure state is passed between legends when changing view/layout
        this.view.addOnResponsiveSwap(function(isMobileView) {
            if(self.wasInit && !isMobileView) {
                if(self.uda.udaSource.getFeatures().length) {
                    var options = {
                        udaColor:   self.uda.udaColor, 
                        opacity:    self.uda.udaLayer.getOpacity(), 
                        visibility: self.uda.udaLayer.getVisible()
                    };
                    self.udaLegendItem.setSymbol(
                        self.uda.udaSource.getFeatures()[0].getGeometry().getType(), 
                        options
                    );
                    self.udaLegendItem.setLegendStatus(true);
                } else {
                    self.udaLegendItem.setLegendStatus(false);
                }
                self._updateLegendControls(self.legend);
            }
        });

        // Start at 36 inches
        setTimeout(() => {
            self.updateSLR(36, true, true);
        }, 2000);
    };
    
    
    //********************************************************************************************************
    // Init and exit functions
    //********************************************************************************************************
    // MUST CALL EXIT to detach event handlers attached to window
    SLR.prototype.exit = function() {
        // some of these don't exist in print mode, but print mode doesn't need to call exit()
        this.view.exit();
        this.slider.exit();
        this.tools.exit();
        this.layers.exit();
        this.legend.exit();
        this.mapHandler.exit();
        this.matrix        = null;
        this.view          = null;
        this.slider        = null;
        this.tools         = null;
        this.layers        = null;
        this.clickLayers   = null;
        this.legend        = null;
        this.mapHandler    = null;
        this.uda.slr       = null;
        this.uda           = null;
        this.udaLegendItem = null;
    };
    
    SLR.prototype.init = function(restore, onComplete) {
        // promise/sync function
        var self      = this, 
            initCount = 0, 
            initWait  = 0, 
            errors    = [], 
        checkFinished = function() {
            // runs final steps only after all async init functions have completed
            if(++initCount === initWait) {
                // init UI elements
                if(!self.__printMode) {
                    self.view.$panelTopHelpIcon.on('click', function() {
                        self.openGlossary("ommf");
                    });
                    self.view.initScenarioModePanel(
                        self.slrLevels, 
                        self.slrLevels, 
                        self.matrix.getStormSurgeLevels("regional"), 
                        self.matrix.getAllScenarios("regional"), 
                        function(value) { self.updateSLR(value, true, true); }
                    );
                    self.view.on("topPanelSwap", function() {
                        self.view.resetScenarioMode();
                    });
                    self.view.on("bottomPanelSwap", function(val) {
                        self.changeAnalysisMode(val);
                    });
                    self.elements.modeToggle.asJQuery().on('click', function() {
                        switch(self.state.get("analysismode")) {
                            case "flooding":
                                return self.view.swapTabs("bottom", "consequence");
                            case "consequence":
                                return self.view.swapTabs("bottom", "flooding");
                        }
                    });
                }
                // init UDA last to ensure it's done on top of counties
                self.uda.init();
                // restore state (even if undefined, must be run to set defaults)
                self.__restoreState(restore);
                // layer interactions cannot be enabled correctly until after loading
                if(!self.__printMode) self.__initLayerInteractions();
                // show attributions
                self.elements.attributions.asJQuery().show();
                // update legend to match layer statuses
                self._updateLegendControls(self.legend);
                // finish init
                self.wasInit = true;
                if(onComplete) onComplete(errors);
                onComplete = null;
            }
        }, 
        addInitProcess = function() {
            ++initWait;
            return checkFinished;
        };
        // init additional modules
        this.udaLegendItem = new UDALegendItem(self.uda, "main");
        this.matrix.init(addInitProcess());
        if(!self.__printMode) {
            var toolParams = {
                slr:          this, 
                mode:         this.state.get("analysismode"), 
                view:         this.view, 
                uda:          this.uda, 
                mapHandler:   this.mapHandler, 
                onComplete:   addInitProcess(), 
                render: {
                    mobileLegend:    this._renderMobileLegend.bind(this), 
                    mobileScenarios: this._renderMobileScenarios.bind(this)
                }, 
                printCallback: this.openPrintLayout.bind(this), 
                udaLegendItem: this.udaLegendItem, 
                helpCallback:  this.openSplashModal.bind(this, false)
            };
            // tools is depend on init completing first
            this.view.init(function() {
                // at this point, wait count has been increased by calling addInitProcess in toolParams above
                var onComplete = addInitProcess();  // add another to wait count
                self.tools.init(toolParams);        // begin tool init process
                onComplete();                       // now mark as done (if called earlier wait count will be met)
            });
        }
        // init layers and populate legend (minus UDA if print mode)
        this.layers.init(
            this.mapHandler.olMap, 
            this.legend, 
            addInitProcess(), 
            this.openGlossary.bind(this)
        );
        if(!self.__printMode) {
            this.udaLegendItem.init(self.legend, {udaColor: self.uda.udaColor});
        }
        // map of clickable layers
        this.clickLayers = {};
        [
            "oceanhash", 
            "ecchash", 
            "inundation", 
            "inundation2", 
            "overtopping", 
            "consq-hwy-vehicle", 
            "consq-hwy-truck", 
            "consq-rail", 
            "consq-recreation", 
            "consq-tidalhabitat", 
            "consq-housing", 
            "consq-jobs", 
            "consq-vulcom-social", 
            "consq-vulcom-contam", 
            "focusareas"
        ].forEach(function(key) {
            self.clickLayers[key] = self.layers.getLayers(key)[0];
        });
        // array of printable layers (layers not on this list will be removed in print mode)
        this.printLayers = [
            "counties", 
            "legaldelta",
            "inundation", 
            "inundation2", 
            "overtopping", 
            "lowlying", 
            "consq-hwy-vehicle", 
            "consq-hwy-truck", 
            "consq-rail", 
            "consq-recreation", 
            "consq-tidalhabitat", 
            "consq-housing", 
            "consq-jobs", 
            "consq-vulcom-social", 
            "consq-vulcom-contam"
        ];
        // clear county selection
        this.selectCountyByFeature(null);
    };
    
    SLR.prototype.__initLayerInteractions = function(onComplete) {
        var self = this;
        // focus on county with map view change
        var selectCountyOnViewChange = function() {
            var feature = self.getRegionAuto();
            if(feature && (!self.selectedCounty || feature.get("NAME").toLowerCase() !== self.selectedCountry)) {
                self.selectCountyByFeature(feature);
            } else if(self.selectedCounty) {
                self.selectCountyByFeature(null);
            }
        };
        this.mapHandler.on("view:change", selectCountyOnViewChange);
        // create WMS click functionality
        this.mapHandler.addWMSClickFunctionality(
            "clickinfo",                        // interaction unique name
            function() { return true; },        // always return true as long as feature is found
            this._renderClickPopup.bind(this),  // popup function
            this._finishClickPopup.bind(this)   // on complete, enable link in popup
        );
        this.mapHandler.applyWMSClickFunctionality("clickinfo", Object.values(this.clickLayers));
        // aliases for TMS layer sources with WMS alias for getFeatureRequests
        for(var key in this.clickLayers) {
            var clickSource = this.layers.getLayerClickSource(key);
            if(clickSource) this.mapHandler.addAliasForTMS(this.clickLayers[key], clickSource);
        }
        if(onComplete) onComplete();
    };
    
    
    //********************************************************************************************************
    // State functions
    //********************************************************************************************************
    // this is called in construction, split out for readability
    SLR.prototype.__initState = function(options) {
        // set state change listeners
        if(options.stateOn) {
            for(var key in options.stateOn) {
                this.state.on(key, options.stateOn[key]);
            }
        }
        // initial state values
        var self = this, 
            olView = this.mapHandler.olMap.getView();
        this.state.add("slrvalue", 0);
        this.state.add("analysismode", "flooding");
        this.state.add("mapcenter", olView.getCenter());
        this.state.add("mapzoom", olView.getZoom());
        this.state.add("basemapindex", this.mapHandler.basemapModule.lastLayerIndex);
        // sync map view updates to state
        this.mapHandler.on("view:change", function() {
            var olView = self.mapHandler.olMap.getView();
            self.state.set("mapcenter", olView.getCenter());
            self.state.set("mapzoom", olView.getZoom());
        });
        this.mapHandler.on("basemap:change", function() {
            self.state.set("basemapindex", self.mapHandler.basemapModule.lastLayerIndex);
        });
        // bind state change event listeners
        this.state.on("set", function(event, key, value, old) {
            if(key === "slrvalue") {
                self.__setSlrValue(value);
            } else if(key === "analysismode") {
                self.__setAnalysisMode(value);
            }
        });
        // bind layer state listener
        if(options.layerChange) {
            this.layers.onChange(function() {
                var layerStates = this.getState();
                // Layers which are hidden by mode swap but otherwise shown (AKA if swapped mode back, they 
                // should be made visible) are given "hiddenByMode" value while "visibility" remains false.
                if(self.legend) {
                    for(var name in layerStates) {
                        if(!layerStates[name].visible && name in self.legend._rememberVisibility && self.legend._rememberVisibility[name]) {
                            layerStates[name].hiddenByMode = true;
                        }
                    }
                }
                options.layerChange(layerStates);
            });
        }
        //bind uda change listener
        if(options.udaChange) {
            this.uda.onChange(function() {
                options.udaChange(this.getFeaturesWkt());
            });
        }
    };
    
    SLR.prototype.__restoreState = function(restore) {
        // defaults (note this overrides defaults set in slr-layers, if layer states provided)
        restore = restore || {};
        restore.analysismode = restore.analysismode || "flooding";
        restore.layers = restore.layers || {};
        
        var hasValue = function(val) { return val || val === 0; };
        if(restore.mapcenter && hasValue(restore.mapzoom)) {
            var olView = this.mapHandler.olMap.getView();
            olView.setCenter(restore.mapcenter);
            olView.setZoom(restore.mapzoom);
            olView.changed();
        }
        if(hasValue(restore.basemapindex)) this.mapHandler.basemapModule.changeBasemap(restore.basemapindex);
        if(hasValue(restore.slrvalue))     this.updateSLR(restore.slrvalue, true);
        if(hasValue(restore.analysismode)) this.changeAnalysisMode(restore.analysismode);
        if(restore.layers) {
            for(var name in restore.layers) {
                var state = restore.layers[name];
                if(state) this.legend._restore(name, state);
            }
        }
        if(restore.uda) {
            this.uda.setUdaFromWkt(restore.uda, function(geomType) {
                this.udaLegendItem.update(geomType);
            });
        }
    };
    
    SLR.prototype.updateSLR = function(slr, sliderIndependent, fromScenarioMode) {
        if(!slr || slr < 0) slr = 0;
        this.state.set("slrvalue", slr);
        if(this.__printMode) return;
        // Basically, if this is programmatic (not from slider), move slider manually, but suppress event 
        // listener (or moving slider will call this function again). May also need to manually reset scenario
        // mode panel and swap tabs to TWL details
        if(sliderIndependent) this.slider.moveSlideToValue(slr, true);
        if(!fromScenarioMode) {
            this.view.resetScenarioMode();
            this.view.swapTabs("top", "twl");
        }
    };
    SLR.prototype.__setSlrValue = function(slr) {
        // triggered via set in state
        this.mapHandler.closePopup();
        this.layers.updateLayers(slr);
        if(!this.__printMode) this.updateInundationScenarios(null, true);
    };
    
    SLR.prototype.changeAnalysisMode = function(mode) {
        if(this.__printMode) return;
        if(typeof mode === "number") {
            mode = !mode ? "flooding" : "consequence";
        } else {
            mode = mode.toLowerCase();
            switch(mode) {
                case "flooding":
                case "consequence":
                    break;
                default:
                    mode = "flooding";
                    break;
            }
        }
        this.state.set("analysismode", mode);
    };
    SLR.prototype.__setAnalysisMode = function(mode) {
        this.mapHandler.closePopup();
        // triggered via set in state
        switch(mode) {
            case "flooding":
                this.elements.legendIntro1.asElementSingle().style["display"] = "";
                this.elements.legendIntro2.asElementSingle().style["display"] = "none";
                this.legend.hideItem("consequence");
                this.legend.hideItem("inundation2");
                this.legend.showItem("inundation");
                this.legend.showItem("overtopping");
                this.legend.showItem("lowlying");
                this.legend.showItem("counties");
                this.legend.showItem("legaldelta");
                this.legend.showItem("uda");
                //this.view.$menuButtons.uda.css('visibility', '');
                this.uda.udaLayer.setVisible(true);
                this.elements.modeToggle.asJQuery().removeClass("on");
                this.elements.modeToggleLabel.asJQuery().html("Viewing Flooding");
                if(!window.slrm_basemap_adjusted) this.mapHandler.basemapModule.changeBasemap(0);
                break;
            case "consequence":
                this.elements.legendIntro1.asElementSingle().style["display"] = "none";
                this.elements.legendIntro2.asElementSingle().style["display"] = "";
                this.legend.showItem("consequence");
                this.legend.showItem("inundation2");
                this.legend.hideItem("inundation");
                this.legend.hideItem("overtopping");
                this.legend.hideItem("lowlying");
                this.legend.hideItem("counties");
                this.legend.hideItem("legaldelta");
                this.legend.hideItem("uda");
                //this.view.$menuButtons.uda.css('visibility', 'hidden');
                this.uda.udaLayer.setVisible(false);
                this.elements.modeToggle.asJQuery().addClass("on");
                this.elements.modeToggleLabel.asJQuery().html("Viewing Consequence");
                if(!window.slrm_basemap_adjusted) this.mapHandler.basemapModule.changeBasemap(2);
                break;
            default:
                return;
        }
        this.view.$panelBottomContent.scrollTop(0);
        this.legend.updateLegendControls(this.layers.getState());
        // Ensure tabs are synced (redundant if called from swap tab event but skips listener to avoid 
        // infinite loop). Only case this is necessary is mobile switch UI, but easier to just ensure rather 
        // than check for special case.
        this.view.swapTabs("bottom", mode, null, true);
    };
    
    
    //********************************************************************************************************
    // Misc. functions
    //********************************************************************************************************
    SLR.prototype.closePopups = function() {
        this.mapHandler.closePopup();
    };
    
    SLR.prototype.forceResizeAdjust = function() {
        this.mapHandler.olMap.updateSize();
        this.view._adjustPanelHeights();
        this.slider.eventHandlers.resizeEndListener();
    };
    
    SLR.prototype.openSplashModal = function(initApplication) {
        var self = this;
        if(initApplication) {
            // prep for animation
            this.slider._moveSlide(this.slider.scale(this.slrLevels[this.slrLevels.length-1]));
        }
        modals.open(
            'splash', 
            {
                url: "partials/slr-splash.php", 
                id: "slr-splash-modal", 
                force: initApplication
            }, 
            function() {
                $(".cm-modal-inner .btn2.accept").on('click', function() {
                    modals.close();
                    if(initApplication) self.slider.animateIntro(); // animate slider
                });
                $(".cm-modal-inner .btn2.tutorial").on('click', function(evt) {
                    if(initApplication) self.slider._moveSlide(self.slider.scale(0));  // reset slider, won't be doing animation
                    evt.stopPropagation();
                    modals.open(
                        'tutorial', 
                        {
                            url: "partials/slr-tutorial.html", 
                            id: "slr-tutorial-modal", 
                            force: true, 
                            showCloser: true
                        }, 
                        function(modalElem) {
                            new SLRTutorial(modalElem);
                            $(".cm-modal-inner .btn2.close").on('click', function() {
                                modals.close();
                            });
                        }
                    );
                });
                // Exploratorium modification -- automatically close tutorial after 1 second
                setTimeout(() => {
                    console.log("1 second");
                    modals.close();
                    if(initApplication) self.slider.animateIntro(); // animate slider
                }, 1000);
            }
        );
    };
    
    SLR.prototype.openGlossary = function(key, returnToLegendButton) {
        var self = this;
        modals.open(
            "glossary", 
            {
                url: "partials/text/glossary.html", 
                id: "modal-info", 
                addCloseButton: !returnToLegendButton
            }, 
            function(modalContent) {
                self.site.enableSiteLinks(modalContent);
                $(".glossary-"+key).show();
                if(returnToLegendButton) {
                    modalContent.find(".return-legend-btn")
                        .show()
                        .on('click', function(evt) {
                            evt.stopPropagation();
                            self.tools.open("legend",  self._renderMobileLegend.bind(self), true);
                        });
                }
            }
        );
    };
    
    SLR.prototype.openShorelineGlossary = function(shorelineType) {
        var key;
        switch(shorelineType.toLowerCase()) {
            case "berm":
            case "channel or opening":
            case "embankment":
            case "engineered levee":
            case "floodwall":
            case "natural shoreline":
            case "shoreline protection structure":
            case "transportation structure":
            case "water control structure":
            case "wetland":
                key = shorelineType.toLowerCase().replace(new RegExp(' ', 'g'), "-");
                break;
            case "tidegate":
                key = "water-control-structure";
                break;
            case "weltand":  // this typo exists in the data
                key = "wetland";
                break;
            default:
                return;
        }
        modals.open(
            "shoreline-glossary", 
            {url: "partials/text/shoreline-glossary.html", id:"modal-glossary-shoreline", addCloseButton: true}, 
            function(modalElem) {
                modalElem.find(".glossary-"+key).show();
            }
        );
    };
    
    
    //********************************************************************************************************
    // County state functions
    //********************************************************************************************************
    SLR.prototype.getRegionAuto = function() {
        var region = null, 
            view = this.mapHandler.olMap.getView();
        if(view.getZoom() > 10) {
            var center = view.getCenter(), 
                countiesSource = this.layers.getLayers("counties")[0].getSource(), 
                feats = countiesSource.getFeaturesAtCoordinate(center);
            if(feats && feats.length) {
                return feats[0];
            } else {
                // match by nearest centroid
                feats = countiesSource.getFeatures();
                var closest = null, 
                    distance = null;
                for(var i = 0; i < feats.length; ++i) {
                    var extent  = feats[i].getGeometry().getExtent(), 
                        newDist = Math.sqrt(
                            Math.pow(center[0]-0.5*(extent[0]+extent[2]), 2) +
                            Math.pow(center[1]-0.5*(extent[1]+extent[3]), 2)
                        );
                    if(!closest || newDist < distance) {
                        closest = feats[i];
                        distance = newDist;
                    }
                }
                return closest;
            }
        }
        return region;
    };
    
    SLR.prototype.selectCountyByFeature = function(feature) {
        this.layers.highlightCounty(feature);
        this.updateInundationScenarios(feature ? feature.get("NAME") : "regional");
    };
    
    //********************************************************************************************************
    // Inundation scenarios functions
    //********************************************************************************************************
    SLR.prototype.updateInundationScenarios = function(county, slrChanged) {
        if(this.__printMode) return;
        if(!slrChanged) {
            if(county === this.selectedCounty) return;
            this.selectedCounty = county;
        } else if(county) {
            this.selectedCounty = county;
        }
        var slrValue = this.state.get("slrvalue"), 
            scenarios = this.matrix.getInundationScenarios(this.selectedCounty, slrValue);
        if(!scenarios) scenarios = [];
        this.view.updateScenarioPanel(
            slrValue, 
            this.selectedCounty, 
            scenarios, 
            this.site, 
            this.openGlossary.bind(this)
        );
    };
    
    
    //********************************************************************************************************
    // Click popup functions
    //********************************************************************************************************
    SLR.prototype._renderClickPopup = function(featsInfo) {
        console.debug(featsInfo);
        // got so long, moved it into separate import
        return slrClickRender.apply(this, [featsInfo]);
    };
    
    SLR.prototype._finishClickPopup = function(popupElem) {
        if(!popupElem) return;
        if(!popupElem.html()) return this.mapHandler.closePopup();
        var self = this;
        popupElem.find(".shoreline-glossary-link").on("click", function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            self.openShorelineGlossary(this.innerHTML);
        });
        popupElem.find(".glossary-link").on("click", function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            self.openGlossary(this.getAttribute("value"));
        });
    };
    
    
    //********************************************************************************************************
    // Legend functions
    //********************************************************************************************************
    SLR.prototype._updateLegendControls = function(legend) {
        legend.updateLegendControls(this.layers.getState());
    };
    
    SLR.prototype.createCopyLegend = function(container, id, baseOptions, onComplete) {
        var legend = new SLRLegend(container, null, id);
        this.layers.__initLegend(legend, baseOptions, onComplete);
        this._updateLegendControls(legend);
        // copy hidden items
        for(var key in this.legend._rememberVisibility) {
            legend.hideItem(key);
        }
        if(this.state.get("analysismode") === "flooding") {
            // hide consequence widget
            legend.hideItem("consequence");
            // add UDA if needed
            var hasUda = this.uda.udaSource.getFeatures().length;
            if(hasUda) {
                if(!baseOptions) baseOptions = {};
                baseOptions.udaColor = this.uda.udaColor;
                baseOptions.opacity = this.uda.udaLayer.getOpacity();
                baseOptions.visibility = this.uda.udaLayer.getVisible();
                var udaLegendItem = new UDALegendItem(this.uda, id);
                udaLegendItem.init(
                    legend, 
                    baseOptions, 
                    true, 
                    this.uda.udaSource.getFeatures()[0].getGeometry().getType()
                );
            }
        } else {
            legend.showItem("consequence");
            legend.hideItem("overtopping");
            legend.hideItem("lowlying");
            legend.hideItem("counties");
            legend.hideItem("legaldelta");
            legend.hideItem("uda");
        }
        legend.syncWidgetsOneWay("consequence", this.legend);
    };
    
    SLR.prototype._renderMobileLegend = function() {
        this.createCopyLegend(
            "#slr-modal-legend", 
            "modal", 
            {svgWidth: 80, svgHeight: 80, svgPadding: 10, gradientHeight: 360}, 
            null
        );
    };
    
    SLR.prototype._renderMobileScenarios = function() {
        var slrValue = this.state.get("slrvalue"), 
            scenarios = this.matrix.getInundationScenarios(this.selectedCounty, slrValue);
        if(!scenarios) scenarios = [];
        this.view._updateScenarioPanel(
            $(".slr-modal #slr-modal-scenarios"), 
            slrValue, 
            this.selectedCounty, 
            scenarios, 
            this.site, 
            this.openGlossary.bind(this)
        );
        var self = this, 
            scenarioModeWasInit = false;
        $(".slr-modal #slr-modal-scenarios-switch").html("Choose a Custom Scenario").on("click", function() {
            if(parseInt(this.getAttribute("value"))) {
                this.innerHTML = "Choose a Custom Scenario";
                var panelA = $(".slr-modal #slr-modal-scenarios"), 
                    panelB = $(".slr-modal #slr-modal-scenario-mode"),
                    scenarios = self.matrix.getInundationScenarios(self.selectedCounty, slrValue);
                if(!scenarios) scenarios = [];
                self.view._updateScenarioPanel(
                    panelA, 
                    slrValue, 
                    self.selectedCounty, 
                    scenarios, 
                    self.site, 
                    self.openGlossary.bind(self)
                );
                self.view._resetScenarioMode(panelB);
                panelA.show();
                panelB.hide();
                this.setAttribute("value", 0);
            } else {
                this.innerHTML = "See Similar Flooding Scenarios";
                var panel = $(".slr-modal #slr-modal-scenario-mode");
                if(!scenarioModeWasInit) {
                    self.view._initScenarioModePanel(
                        panel, 
                        self.slrLevels, 
                        self.slrLevels, 
                        self.matrix.getStormSurgeLevels("regional"), 
                        self.matrix.getAllScenarios("regional"), 
                        function(value) { self.updateSLR(value, true, true); }
                    );
                    scenarioModeWasInit = true;
                }
                $(".slr-modal #slr-modal-scenarios").hide();
                panel.show();
                this.setAttribute("value", 1);
            }
        });
    };
    
    
    //********************************************************************************************************
    // Print function
    //********************************************************************************************************
    SLR.prototype.openPrintLayout = function() {
        // copy state
        var settings = this.state.getState();
        settings.layers = this.layers.getState();
        // remove layers that aren't allowed in print
        for(var key in settings.layers) {
            if(!this.printLayers.indexOf(key)) {
                delete settings.layers[key];
            }
        }
        // add UDA
        var udaFeats = this.uda.udaSource.getFeatures();
        if(udaFeats && udaFeats.length) settings.uda = (new ol.format.WKT()).writeFeatures(udaFeats);
        // create form to pass data via POST
        var printForm = document.createElement("form"), 
            inputSettings = document.createElement("input");
        printForm.target = "_blank";
        printForm.method = "POST";
        printForm.action = "/print.php";
        printForm.style["display"] = "none";
        inputSettings.type  = "text";
        inputSettings.name  = "s";
        inputSettings.value = btoa(JSON.stringify(settings));
        printForm.appendChild(inputSettings);
        document.body.appendChild(printForm);
        // create google analytic event
        if(typeof window.gtag !== "undefined") {
            var centerCoords = ol.proj.toLonLat(settings.mapcenter, this.mapHandler.projWebMercator);
            window.gtag('event', 'print_' + settings.slrvalue.toString(), {
                "event_category": "print_map", 
                "event_label": (
                    settings.mapzoom + " @ " + 
                    centerCoords[0].addCommas(2) + ", " + 
                    centerCoords[1].addCommas(2)
                )
            });
        }
        // submit then remove form
        printForm.submit();
        printForm.remove();
        inputSettings = null;
        printForm = null;
    };
    
    return SLR;
});
