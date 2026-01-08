
define([
    'jquery', 
    'common'
], function(
    jQuery, 
    common
) {
    
    function SLRView(elements, config) {
        this.elements                = elements;
        this.panelSelect             = this.elements.controlPanel.selector;
        this.$panel                  = this.elements.controlPanel.asJQuery();
        this.$panelTop               = this.elements.cpTop.asJQuery();
        this.$panelTopTitle          = this.$panelTop.find(".side-panel-title");
        this.$panelTopHelpIcon       = this.$panelTopTitle.find("#help-icon-many-futures");
        this.$panelTopControls       = this.$panelTop.find(".side-panel-tab-ctrl");
        this.$panelTopControlTabs    = null;  // created dynamically later
        this.$panelTopContentA       = this.$panelTop.find(".side-panel-content.content-a").show();
        this.$panelTopContentB       = this.$panelTop.find(".side-panel-content.content-b").hide();
        this.$panelBottom            = this.elements.cpBottom.asJQuery();
        this.$panelBottomTitle       = this.$panelBottom.find(".side-panel-title");
        this.$panelBottomControls    = this.$panelBottom.find(".side-panel-tab-ctrl");
        this.$panelBottomControlTabs = null;  // created dynamically later
        this.$panelBottomContent     = this.$panelBottom.find(".side-panel-content");
        this.$panelDrag              = this.elements.cpDrag.asJQuery();
        this.$headerMenu             = this.elements.headerMenu.asJQuery();
        this.$menu                   = this.elements.menu.asJQuery();
        this.$menuRes                = this.elements.menuResponsive.asJQuery();
        this.$menuButtons            = {};
        
        this._html = {
            scenarioTable: ["partials/slr-scenario-table.html", null], 
            scenarioMode:  ["partials/slr-scenario-mode.html", null], 
            scenarioModal: ["partials/slr-scenario-modal.html", null]
        };
        
        this._wasInit         = false;
        this._isDraggingPanel = false;
        this._inMobileView    = window.screen.width < config.responsiveWidth;
        this._eventListeners  = {};
        
        var self = this;
        this._adjustPanelHeights = function(evt) { };
        this._windowOnMouseMoveListener = function(evt) {
            if(self._isDraggingPanel) {
                self._adjustPanelHeights(evt);
                evt.preventDefault();
            }
        };
        this._windowOnMouseUpListener = function() {
            self._isDraggingPanel = false;
        };
        this._onResponsiveSwap = [];
        this._windowEventListener = function() {
            self._adjustPanelHeights();
            var changed = false;
            if(self._inMobileView) { 
                if(window.screen.width >= config.responsiveWidth) {
                    self._inMobileView = false;
                    changed = true;
                    if($("#slr-modal-mobile").length) {
                        common.closeModal();
                    }
                }
            } else {
                if(window.screen.width < config.responsiveWidth) {
                    self._inMobileView = true;
                    changed = true;
                }
            }
            if(changed && self._onResponsiveSwap.length) {
                for(var i = 0; i < self._onResponsiveSwap.length; i++) {
                    self._onResponsiveSwap[i](self._inMobileView);
                }
            }
        };
    }
    
    
    //********************************************************************************************************
    // Init/exit functions
    //********************************************************************************************************
    SLRView.prototype.init = function(onComplete) {
        if(this._wasInit) {
            alert("Already initialized");
            if(onComplete) onComplete();
            onComplete = null;
            return;
        }
        var toolsHtml, headerToolsHtml, 
            count = 0, 
            wait = 3, 
            self = this;
        var onReady = function() {
            if(++count === wait) {
                self._initControlPanel();
                self._initPanels();
                self._initSlrMenu(toolsHtml, headerToolsHtml);
                self._wasInit = true;
                if(onComplete) onComplete();
                onComplete = null;
            }
        };
        $.ajax({
            url: "partials/slr-tools.html", 
            success: function(html) {
                toolsHtml = html;
            }, 
            error: function(jqXHR, textStatus, errorThrown) {
                console.debug("Error downloading tools HTML");
                console.debug(textStatus + ": " + errorThrown);
            }, 
            complete: function() {
                onReady();
            }
        });
        $.ajax({
            url: "partials/slr-header-tools.html", 
            success: function(html) {
                headerToolsHtml = html;
            }, 
            error: function(jqXHR, textStatus, errorThrown) {
                console.debug("Error downloading header tools HTML");
                console.debug(textStatus + ": " + errorThrown);
            }, 
            complete: function() {
                onReady();
            }
        });
        this._getHtmlAsync("scenarioMode", function(html) {
            self.$panelTopContentB.html(html);
            onReady();
        });
    };
    
    SLRView.prototype.exit = function() {
        // empty menu
        this.$headerMenu.html("");
        // Cleanup event listeners tied to body/window
        window.removeEventListener('mousemove', this._windowOnMouseMoveListener);
        window.removeEventListener('mouseup', this._windowOnMouseUpListener);
        window.removeEventListener('resize', this._windowEventListener);
    };
    
    //********************************************************************************************************
    // Private init functions
    //********************************************************************************************************
    SLRView.prototype._initControlPanel = function() {
        // lots of static vars
        var self            = this, 
            lastPanelHeight = 0, 
            lastDragY       = null, 
            dragHeight      = this.$panelDrag.outerHeight(), 
            panelHeight     = this.$panel.height(), 
            btmMinHeight    = parseInt(this.$panelBottom.css('min-height')), 
            topMinHeight    = parseInt(this.$panelTop.css('min-height'));
        // redefine adjust function
        this._adjustPanelHeights = function(evt) {
            var newPanelTopHeight, newPanelBtmHeight;
            if(!evt) {
                // no event if firing for first time or on resize
                panelHeight = self.$panel.height();
                newPanelTopHeight = self.$panelTop.innerHeight();
            } else {
                newPanelTopHeight = lastPanelHeight + evt.clientY - lastDragY;
            }
            if(newPanelTopHeight < topMinHeight) {
                // can't be smaller than min height
                newPanelTopHeight = topMinHeight;
            } else if(newPanelTopHeight + btmMinHeight + dragHeight > panelHeight) {
                // can't get so tall to push bottom panel off
                newPanelTopHeight = panelHeight - btmMinHeight - dragHeight;
            }
            newPanelBtmHeight = panelHeight - newPanelTopHeight - dragHeight;
            if(!evt) {
                // check bottom height too for resize events
                if(newPanelBtmHeight < btmMinHeight) {
                    newPanelBtmHeight = btmMinHeight;
                } else if(newPanelBtmHeight + topMinHeight + dragHeight > panelHeight) {
                    newPanelBtmHeight = panelHeight - topMinHeight - dragHeight;
                }
                newPanelTopHeight = panelHeight - newPanelBtmHeight - dragHeight;
            }
            console.debug(panelHeight + " = " + newPanelTopHeight + " + " + newPanelBtmHeight + " + "  + dragHeight + " = " + (newPanelTopHeight + newPanelBtmHeight + dragHeight));
            // use percentages so it holds, even with resize
            self.$panelTop.height("calc(" + (100 * (newPanelTopHeight+dragHeight) / panelHeight) + "% - " + dragHeight + "px)");
            self.$panelBottom.height("calc(" + (100 * (newPanelBtmHeight+dragHeight) / panelHeight) + "% - " + dragHeight + "px)");
        };
        // fire for first time to auto-adjust height to fit
        this._adjustPanelHeights();
        // add event listeners to drag bar
        this.$panelDrag
            .on('mousedown', function(evt) {
                self._isDraggingPanel = true;
                lastDragY = evt.clientY;
                lastPanelHeight = self.$panelTop.outerHeight();
                evt.preventDefault();
            });
        // add event listeners to body
        window.addEventListener('mousemove', this._windowOnMouseMoveListener);
        window.addEventListener('mouseup', this._windowOnMouseUpListener);
        // event lisnteners to resize (wrap callback to hide event parameter)
        window.addEventListener('resize', this._windowEventListener);
    };
    
    SLRView.prototype._initPanels = function() {
        var self = this;
        
        $("<li>", {html: "Total Water Level"}).appendTo(this.$panelTopControls)
            .attr("value", "twl")
            .addClass("selected");
        $("<li>", {html: "Choose a Scenario"}).appendTo(this.$panelTopControls)
            .attr("value", "scenario");
        this.$panelTopControlTabs = this.$panelTopControls.find("li");
        this.$panelTopControlTabs.on('click', function() {
            self.swapTabs("top", this.getAttribute("value"), this);
        });
        
        $("<li>", {html: "Flooding"}).appendTo(this.$panelBottomControls)
            .attr("value", "flooding")
            .addClass("selected");
        $("<li>", {html: "Consequence"}).appendTo(this.$panelBottomControls)
            .attr("value", "consequence");
        this.$panelBottomControlTabs = this.$panelBottomControls.find("li");
        this.$panelBottomControlTabs.on('click', function() {
            self.swapTabs("bottom", this.getAttribute("value"), this);
        });
    };
    
    SLRView.prototype._initSlrMenu = function(toolsHtml, headerToolsHtml) {
        this.$headerMenu.html(headerToolsHtml);
        // add toolbar to top menu and remove items that don't apply to particular zoom
        this.$menu.html(toolsHtml).find(".mobile-view-show").remove();
        this.$menuRes.html(toolsHtml).find(".mobile-view-hide").remove();
        // for alt/mobile layout, change tooltip position
        this.$menuRes.find(".slr-menu-item").addClass("cm-tooltip-top").removeClass("cm-tooltip-bottom cm-tooltip-left");
        // bind buttons to objects
        this.$menuButtons.defaultView = this.$menu.find("#slr-tool-defaultview")
                                          .add(this.$menuRes.find("#slr-tool-defaultview"));
        /*
        this.$menuButtons.zoomIn      = this.$menu.find("#slr-tool-zoomin")
                                          .add(this.$menuRes.find("#slr-tool-zoomin"));
        this.$menuButtons.zoomOut     = this.$menu.find("#slr-tool-zoomout")
                                          .add(this.$menuRes.find("#slr-tool-zoomout"));
                                          */
        this.$menuButtons.geolocator  = this.$menu.find("#slr-tool-geolocate")
                                          .add(this.$menuRes.find("#slr-tool-geolocate"));
        this.$menuButtons.geolocation = this.$menu.find("#slr-tool-geolocation")
                                          .add(this.$menuRes.find("#slr-tool-geolocation"));
        this.$menuButtons.legend      = this.$menu.find("#slr-tool-legend")
                                          .add(this.$menuRes.find("#slr-tool-legend"));
        /*
        this.$menuButtons.basemaps    = this.$menu.find("#slr-tool-basemaps")
                                          .add(this.$menuRes.find("#slr-tool-basemaps"));
        this.$menuButtons.uda         = this.$menu.find("#slr-tool-uda")
                                          .add(this.$menuRes.find("#slr-tool-uda"));
                                          */
        this.$menuButtons.scenarios   = this.$menu.find("#slr-tool-scenarios")
                                          .add(this.$menuRes.find("#slr-tool-scenarios"));
        this.$menuButtons.help        = this.$headerMenu.find("#slr-tool-help").parent(".slr-header-tool-wrapper");
        this.$menuButtons.print       = this.$headerMenu.find("#slr-tool-print").parent(".slr-header-tool-wrapper");
        this.$menuButtons.feedback    = this.$headerMenu.find("#slr-tool-feedback").parent(".slr-header-tool-wrapper");
        this.$menuButtons.getInvolved = this.$headerMenu.find("#slr-tool-get-involved").parent(".slr-header-tool-wrapper");
        this.$menuButtons.more        = this.$menuRes.find("#slr-tool-more");
    };
    
    
    //********************************************************************************************************
    // Event listening
    //********************************************************************************************************
    SLRView.prototype.addOnResponsiveSwap = function(callback) {
        this._onResponsiveSwap.push(callback);
    };
    
    SLRView.prototype.removeOnResponsiveSwap = function(callback) {
        var index = $.inArray(callback, this._onResponsiveSwap);
        if(index >= 0) this._onResponsiveSwap.splice(index, 1);
    };
    
    SLRView.prototype.on = function(event, callback) {
        this._eventListeners[event] = callback;
    };
    
    
    //********************************************************************************************************
    // Content handling
    //********************************************************************************************************
    SLRView.prototype._getHtmlAsync = function(key, onComplete) {
        if(!this._html[key]) {
            onComplete("");
            return;
        }
        if(this._html[key][1]) {
            onComplete(this._html[key][1]);
            return;
        }
        var self = this;
        $.ajax({
            url: this._html[key][0], 
            success: function(html) {
                self._html[key][1] = html;
            }, 
            complete: function() {
                onComplete(self._html[key][1]);
            }
        });
    };
    
    SLRView.prototype.swapTabs = function(topOrBottom, swapTo, tabElement, skipListener) {
        var tabs;
        if(topOrBottom === 0 || topOrBottom === "top") {
            if(swapTo === "twl" || swapTo === 0) {
                this.$panelTopContentA.show();
                this.$panelTopContentB.hide();  
            } else if(swapTo === "scenario" || swapTo === 1) {
                this.$panelTopContentA.hide();
                this.$panelTopContentB.show();
            } else {
                this.$panelTopContentA.hide();
                this.$panelTopContentB.hide();
            }
            if(!skipListener && this._eventListeners["topPanelSwap"]) {
                this._eventListeners["topPanelSwap"](swapTo);
            }
            tabs = this.$panelTopControlTabs;
        } else if(topOrBottom === 1 || topOrBottom === "bottom") {
            if(!skipListener && this._eventListeners["bottomPanelSwap"]) {
                this._eventListeners["bottomPanelSwap"](swapTo);
            }
            tabs = this.$panelBottomControlTabs;
        } else {
            return;
        }
        if(!tabElement) {
            for(var i = 0; i < tabs.length; ++i) {
                if(tabs[i].getAttribute("value") === swapTo) {
                    tabElement = tabs[i];
                    break;
                }
            }
            if(!tabElement) return;
        }
        if(tabElement.classList.contains("selected")) return;
        tabs.removeClass("selected");
        tabElement.classList.add("selected");
    };
    
    SLRView.prototype.setTopPanelContent = function(title, contentA, contentB) {
        if(title || title === "")       this.$panelTopTitle.html(title);
        if(contentA || contentA === "") this.$panelTopContentA.html(contentA);
        if(contentB || contentB === "") this.$panelTopContentB.html(contentB);
    };
    
    SLRView.prototype.setBottomPanelContent = function(title, content) {
        if(title || title === "") this.$panelBottomTitle.html(title);
        this.$panelBottomContent.html(content);
    };
    
    SLRView.prototype.updateScenarioPanel = function(slrValue, selectedCounty, scenarios, site, glossaryFunction) {
        this.setTopPanelContent(null, "");
        this._updateScenarioPanel(this.$panelTopContentA, slrValue, selectedCounty, scenarios, site, glossaryFunction);
    };
    
    SLRView.prototype._updateScenarioPanel = function(contentElem, slrValue, selectedCounty, scenarios, site, glossaryFunction) {
        this._getHtmlAsync("scenarioTable", function(html) {
            contentElem.html(html);
            // basic details
            var isRegional = selectedCounty.toLowerCase() === "regional";
            if(!slrValue) {
                contentElem.find("#slr-no-flooding-results").show();
                contentElem.find("#slr-flooding-results").hide();
                contentElem.find("#slr-scenario-table").hide();
                contentElem.find(".subtitle").hide();
            } else {
                contentElem.find("#slr-no-flooding-results").hide();
                contentElem.find("#slr-flooding-results").show();
                contentElem.find("#slr-scenario-txt-depth").html(slrValue);
                if(!isRegional) {
                    contentElem.find("#slr-scenario-txt-county").html(selectedCounty).css("text-transform", "capitalize");
                    contentElem.find(".slr-scenario-txt-regional").hide();
                } else {
                    contentElem.find("#slr-scenario-txt-county").html("SF-Bay region");
                    contentElem.find(".slr-scenario-txt-county").hide();
                }
                // there is a site-link in the content we need to activate
                if(site) site.enableSiteLinks(contentElem);
                // populate flooding scenarios table
                var table = contentElem.find("#slr-scenario-table");
                if(!scenarios.length && !slrValue) {
                    table.append("<tr><td colspan=2>Existing Conditions</td></tr>");
                } else {
                    for(var s = 0; s < scenarios.length; ++s) {
                        scenarios[s].stormSurge = (
                            scenarios[s].stormSurge ? 
                                (scenarios[s].stormSurge === 1 ? "King Tide" : scenarios[s].stormSurge + "-year")
                                : "No Storm Surge"
                        );
                        table.append("<tr><td>" + scenarios[s].slr + "\"</td><td>" + scenarios[s].stormSurge + "</td></tr>");
                    }
                }
                // help icon
                contentElem.find(".scenario-help-link").on("click", function(evt) {
                    if(!glossaryFunction) return;
                    evt.preventDefault();
                    evt.stopPropagation(); // cause may be opened from modal flooding scenarios
                    glossaryFunction(this.getAttribute("value"));
                });
            }
        });
    };
    
    SLRView.prototype.initScenarioModePanel = function(slrLevelsFull, slrLevels, stormSurgeLevels, scenariosMatrix, onUpdate) {
        this._initScenarioModePanel(
            this.$panelTopContentB, 
            slrLevelsFull, 
            slrLevels, 
            stormSurgeLevels, 
            scenariosMatrix, 
            onUpdate
        );
    };
    
    SLRView.prototype._initScenarioModePanel = function(container, slrLevelsFull, slrLevels, stormSurgeLevels, scenariosMatrix, onUpdate) {
        var self = this, 
            scenarioResult = container.find("#scenarios-result").hide();
        // add SLR options
        var slrElem = container.find("#scenarios-slr");
        for(var i = 0; i < slrLevelsFull.length; ++i) {
            slrElem.append(
                $("<div>", {
                    html: slrLevelsFull[i] ? slrLevelsFull[i] + "\"" : "No SLR", 
                    "class": "btn2 scenario-option " + (slrLevelsFull[i] ? "" : "no-slr"), 
                    value: slrLevelsFull[i]
                })
            );
        }
        // add storm surge options
        var ssElem = container.find("#scenarios-stormsurge");
        for(var i = 0; i < stormSurgeLevels.length; ++i) {
            stormSurgeLevels[i] = parseInt(stormSurgeLevels[i]);
            ssElem.append(
                $("<div>", {
                    html: stormSurgeLevels[i] ? (stormSurgeLevels[i] > 1 ? stormSurgeLevels[i] + "-yr" : "King Tide") : "No Storm Surge", 
                    "class": "btn2 scenario-option disabled " + (stormSurgeLevels[i] ? (stormSurgeLevels[i] > 1 ? "" : "king-tide") : "no-ss"), 
                    value: stormSurgeLevels[i], 
                    "cm-tooltip-msg": "Not Mapped"
                })
            );
        }
        var slrElemOptions = slrElem.find(".scenario-option"), 
            ssElemOptions = ssElem.find(".scenario-option");
        // on clicking SLR option
        slrElemOptions.on("click", function() {
            var elem = $(this), 
                slrValue = parseInt(elem.attr("value"));
            // set this as selected
            slrElemOptions.removeClass("selected");
            ssElemOptions.removeClass("selected");
            elem.addClass("selected");
            // disable all storm surge options, clear selected message
            ssElemOptions.addClass("disabled cm-tooltip-bottom");
            // for each storm surge, check which to enable (do 0 option first)
            for(var ssLevel in scenariosMatrix[slrValue]) {
                ssElem.find(".scenario-option[value=" + ssLevel + "]").removeClass("disabled cm-tooltip-bottom");
            }
            // auto select no storm surge to start
            ssElem.find(".no-ss").addClass("selected");
            scenarioResult.hide();
            // call update callback
            self._updateScenarioResultsText(scenarioResult, slrValue, 0, slrValue);
            container.animate({scrollTop: ssElem.offset().top}, 400);
            onUpdate(slrValue);
        });
        
        // on clicking storm surge option
        ssElemOptions.on("click", function() {
            if(this.classList.contains("disabled")) return;
            var elem = $(this);
            // set this as selected
            ssElemOptions.removeClass("selected");
            elem.addClass("selected");
            // get inundation value
            var slrValue = parseInt(slrElem.find(".scenario-option.selected").attr("value")), 
                ssValue = parseInt(elem.attr("value")), 
                inundation = scenariosMatrix[slrValue][ssValue];
            // move slider
            var bestMatch = -9999, 
                bestDiff = 0;
            for(var i = 0; i < slrLevels.length; ++i) {
                var diff = slrLevels[i] - inundation;
                if(diff > 2) break;
                if(bestMatch < 0 || Math.abs(diff) < bestDiff) {
                    bestMatch = slrLevels[i];
                    bestDiff = Math.abs(diff);
                }
            }
            if(bestMatch < 0) bestMatch = 0;
            // update result text
            self._updateScenarioResultsText(scenarioResult, slrValue, ssValue, bestMatch);
            container.animate({scrollTop: scenarioResult.offset().top}, 400);
            // call update callback
            onUpdate(bestMatch);
        });
    };
    
    SLRView.prototype._updateScenarioResultsText = function(container, slrValue, ssValue, bestMatch) {
        container.show().find("#slr-scenario-txt-depth").html(bestMatch);
        if(!slrValue && !ssValue) {
            container.find("p").html(
                "Existing water level at mean higher high water."
            );
        } else if(slrValue) {
            if(!ssValue) {
                container.find("p").html(
                    "Resulting from " + slrValue + "-inches of sea level rise."
                );
            } else if(ssValue === 1) {
                container.find("p").html(
                    "Combination of " + slrValue + "-inches of sea level rise and king tide."
                );
            } else {
                container.find("p").html(
                    "Combination of " + slrValue + "-inches of sea level rise and a " + ssValue + "-year storm surge."
                );
            }
        } else {
            if(ssValue === 1) {
                container.find("p").html(
                    "Resulting from king tide."
                );
            } else {
                container.find("p").html(
                    "Resulting from a " + ssValue + "-year storm surge over the current mean higher high water."
                );
            }
        }
    };
    
    SLRView.prototype.resetScenarioMode = function() {
        this._resetScenarioMode(this.$panelTopContentB);
    };
    
    SLRView.prototype._resetScenarioMode = function(container) {
        container.scrollTop(0);
        container.find("#scenarios-slr .scenario-option").removeClass("selected");
        container.find("#scenarios-stormsurge .scenario-option").removeClass("selected").addClass("disabled");
        container.find("#scenarios-result").hide();
    };
    
    return SLRView;
    
});
