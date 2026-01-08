
define([
    'jquery', 
    'd3', 
    'site-element'
], function(
    jQuery, 
    d3, 
    SiteElement
) {
    
    function SLRSlider(ticks, valHeight) {
        this.elements = (function() {
            var elements = {
                container:  "#slr-container", 
                panel:      "#slr-slider-panel", 
                //slidePopup: "#slr-slide-popup", 
                svg:        "#slr-slider-svg"
            };
            for(var e in elements) { elements[e] = new SiteElement(elements[e]); };
            return elements;
        })();
        
        // hard-coded config values
        this.margins = {
            top:    45, 
            bottom: 80, 
            left:   0, 
            right:  0
        };
        this.colors = {
            bar:        "rgba(0, 0, 0, 0.7)", 
            barFill:    "rgba(0, 122, 135, 0.8)", //"rgba(15, 104, 98, 0.8)", 
            ticks:      "#000", 
            ticksA:     "#fff", 
            ticksB:     "#000", 
            tickLabels: "#fff", 
            slide:      "#98c7c4", //"#47a6bd", //"#477ebc", //"#f3f3f3", 
            slideWave:  "rgb(0, 122, 135)", //"rgb(15, 104, 98)", 
            slideTextA: "#000", 
            slideTextB: "#fff", 
            label:      "#D1F0FF"
        };
        this.ticks       = ticks ? ticks : [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        this.totalInches = valHeight || this.ticks[this.ticks.length-1];
        this.tickLength  = this.ticks.length;
        
        // scale and state variables
        this.scale       = d3.scaleLinear().domain([0, this.totalInches]);
        this._value      = 0;
        
        // element handlers
        // While I tried to keep id and class names abstracted, everything within SVG is going to be 
        // hard-coded
        this.svg = d3.select(this.elements.panel.selector).append("svg")
            .attr("id", this.elements.svg.asId())
            .attr("width", "200%")
            .attr("height", "100%")
            .style('font-family', "'Century Gothic', CenturyGothic, Geneva, AppleGothic, sans-serif")
            .style('overflow', 'visible');
        this.defs    = this.svg.append("defs");
        this.gBar    = this.svg.append("g").attr("id", "slr-slider-g-bar");
        this.gTicks  = this.svg.append("g").attr("id", "slr-slider-g-ticks");
        this.gLabel  = this.svg.append("g").attr("id", "slr-slider-g-label");
        this.gSlide  = this.svg.append("g").attr("id", "slr-slider-g-slide");
        
        // vars/handlers for popup
        //this.$popup = null;
        this.popupText = null;
        this._mouseOver = false;
        this._popupEnabled = false;
        this.defaultPopupText = "Total Water level + MHHW. For more information on additional flood scenarios that lead to this level of flooding, see the “One Map, Many Futures” window to the right.";
        
        // animation vars
        this._isAnimating = false;
        
        // draw slider
        this._drawSlider();
        this._redrawSliderTicks();
        this._redrawLabel();
        this._drawSlide();
        
        // this is to change how interaction with the tooltip works
        this._mobileMode = false;
        
        // prep event handlers (need to persist so we can remove them if necessary)
        var self = this, 
            resizeEnd = null;
        
        // event handlers
        this.eventHandlers = {
            mouseoverSlideListener : function(evt) {
                if(self._isAnimating) return;
                self._mouseOver = true;
                if(self._popupEnabled) {
                    //self.$popup.show();
                }
            }, 
            mouseoutSlideListener  : function(evt) {
                if(self._isAnimating) return;
                self._mouseOver = false;
                //self.$popup.hide();
            }, 
            grabSlideListener      : function(evt) {
                if(self._isAnimating) return;
                console.debug("Slide grabbed");
                self.grabSlide();
                if(self._mobileMode) {
                    //self.$popup.show();
                }
                if(evt && evt.preventDefault) evt.preventDefault();
            }, 
            moveSlideListener      : function(evt) {
                if(self._isAnimating) return;
                if(self._grabbingSlide) {
                    self._moveSlideEvent(evt);
                    if(evt && evt.preventDefault) evt.preventDefault();
                }
                if(self._mobileMode) {
                    //self.$popup.hide();
                }
            }, 
            ungrabSlideListener    : function(evt) {
                if(self._isAnimating) return;
                if(self._grabbingSlide) {
                    console.debug("Slide ungrabbed");
                    self.ungrabSlide(evt && !evt.changedTouches);
                    if(evt && evt.stopPropagation) evt.stopPropagation();
                    if(self._mobileMode) {
                        //self.$popup.show();
                    }
                } else if(self._mobileMode) {
                    //self.$popup.hide();
                }
            }, 
            ungrabMouseOutListener : function(evt) {
                if(self._isAnimating) return;
                evt = evt ? evt : window.event;
                // mouse out from document
                var from = evt.relatedTarget || evt.toElement;
                if(!from || from.nodeName === "HTML") {
                    console.debug("Slide ungrabbed mouseout");
                    self.ungrabSlide();
                }
            }, 
            _resizeEndEvent        : function() {
                self._recalculateScale();
                self._redrawSliderTicks();
                self._redrawLabel();
                var y = self.scale(self._value);
                self._redrawSliderPosition(y);
                self._moveSlide(y);
                //self._updateSlidePopup(y);
            }, 
            resizeEndListener      : function() {
                // self-replacing timeout function so it's not constantly doing it for every single moment of 
                // a resize motion
                clearTimeout(resizeEnd);
                resizeEnd = setTimeout(self.eventHandlers._resizeEndEvent, 50);
            }, 
            sliderChangeListener   : null, 
            svgClickListener       : function() {
                if(self._isAnimating) return;
                self.moveSlideToClientY(d3.event.clientY);
            }
        };
        
        // attach event handlers
        this._addSlideInteractions();
        window.addEventListener('resize', this.eventHandlers.resizeEndListener);
        
        // async download
        $.ajax({
            url: "data/slide-text.json", 
            dataType: "json", 
            success: function(text) {
                self.popupText = {};
                for(var key in text) {
                    self.popupText[parseInt(key)] = text[key];
                }
            }
        });
    }
    
    SLRSlider.prototype.exit = function() {
        window.removeEventListener('resize', this.eventHandlers.resizeEndListener);
        this._removeSlideInteractions();
        //this.$popup.remove();
        // i hate internet explorer so damn much
        try {
            this.gSlide.node().remove();
            this.svg.remove();
        } catch(e) {
            // do nothing
        }
        this.gSlide = null;
        this.svg = null;
        this.eventHandlers = null;
    };
    
    
    //********************************************************************************************************
    // Draw functions, should only be called once
    //********************************************************************************************************
    SLRSlider.prototype._drawSlider = function() {
        this.gBar.append("rect")
            .attr("id", "slr-slider-bar")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", this.colors.bar);
    
        var self   = this, 
            sbbox  = this.gBar.select("#slr-slider-bar").node().getBBox(), 
            tstart = sbbox.width, 
            tend   = tstart - this.tickLength;
        this._recalculateScale(sbbox.height);
        
        this.defs.append("clipPath")
            .attr("id", "slr-slider-tick-label-clipmask")
          .append("rect")
            .attr("y", sbbox.height - this.margins.bottom)
            .attr("width", "100%")
            .attr("height", "100%");
    
        this.gBar.append("rect")
            .attr("id", "slr-slider-bar-fill")
            .attr("x", 3)
            .attr("y", 0)
            .attr("width", window.browserType.isChrome ? "calc(100% - 6px)" : "100%")
            .attr("height", "100%")
            .attr("fill", this.colors.barFill)
            .attr("clip-path", "url(#slr-slider-tick-label-clipmask)")
            .style("-webkit-clip-path", "url(#slr-slider-tick-label-clipmask)");
        
        this.gTicks.selectAll(".slr-slider-tick-a")
            .data(this.ticks).enter()
          .append("path")
            .attr("class", "slr-slider-tick slr-slider-tick-a")
            .attr("stroke", this.colors.ticksA)
            .attr("stroke-width", 2)
            .attr("d", function(d) {
                return (
                    "M" + tstart + " " + self.scale(d) +
                    "H" + tend
                );
            });
        this.gTicks.selectAll(".slr-slider-tick-b")
            .data(this.ticks).enter()
          .append("path")
            .attr("class", "slr-slider-tick slr-slider-tick-b")
            .attr("stroke", this.colors.ticksB)
            .attr("stroke-width", 3)
            .attr("d", function(d) {
                return (
                    "M" + tstart + " " + self.scale(d) +
                    "H" + tend
                );
            })
            .attr("clip-path", "url(#slr-slider-tick-label-clipmask)")
            .style("-webkit-clip-path", "url(#slr-slider-tick-label-clipmask)");
          
        this.gTicks.selectAll(".slr-slider-tick-label")
            .data(this.ticks).enter()
          .append("text")
            .attr("class", "slr-slider-tick-label")
            .attr("x", (tend - 3))
            .attr("y", function(d) { return self.scale(d) + 6; })
            .attr("text-anchor", "end")
            .attr("fill", this.colors.tickLabels)
            .text(function(d) { return d + "\""; });
//            .style("cursor", "pointer")
//            .on('click', function(d) {
//                self.moveSlideToValue(d);
//            });
        /*
        this.gTicks.selectAll(".slr-slider-tick-label-b")
            .data(this.ticks).enter()
          .append("text")
            .attr("class", "slr-slider-tick-label slr-slider-tick-label-a")
            .attr("x", (tend - 3))
            .attr("y", function(d) { return self.scale(d) + 6; })
            .attr("text-anchor", "end")
            .attr("fill", this.colors.ticksA)
            .text(function(d) { return d + "\""; });
        this.gTicks.selectAll(".slr-slider-tick-label-b")
            .data(this.ticks).enter()
          .append("text")
            .attr("class", "slr-slider-tick-label slr-slider-tick-label-b")
            .attr("x", (tend - 3))
            .attr("y", function(d) { return self.scale(d) + 6; })
            .attr("text-anchor", "end")
            .attr("fill", this.colors.ticksB)
            .text(function(d) { return d + "\""; })
            .attr("clip-path", "url(#slr-slider-tick-label-clipmask");
        */
   };
    
    SLRSlider.prototype._drawSlide = function() {
        var torad      = Math.PI*2.0, 
            sbbox      = this.gBar.select("#slr-slider-bar").node().getBBox(), 
            radius     = (sbbox.width+3)*0.5, 
            amplitude  = 1.0, 
            wavelength = sbbox.width*1.3, 
            period     = 1100, 
            resolution = 20.0, 
            y          = this.scale(this._value);;
        
        var waveData = [];
        // twice resolution as we need have extra wavelength to animate
        for(var i = 0; i <= 2*resolution; i++) {
            waveData.push(i/resolution);
        }
        
        var waveGenerator = d3.area("area")
            .x( function(d) { return d*wavelength; })
            .y0(function(d) { return radius; })
            .y1(function(d) { return amplitude * Math.sin(d*sbbox.width/wavelength*torad); });
        
        var wave = this.defs.append("clipPath")
            .attr("id", "slr-slider-wave-clipmask")
            .attr("transform", "translate(0,"+y+")")
          .selectAll("#slr-slider-sel-wave")
            .data([waveData]).enter()
          .append("path")
            .attr("d", waveGenerator);
        
        
        this.gSlide.append("circle")
            .attr("id", "slr-slider-sel-circ-back")
            .attr("class", "slr-slider-sel-circ")
            .attr("cx", "50%")
            .attr("cy", y)
            .attr("r", radius)
            .attr("fill", this.colors.slide);
        this.gSlide.append("circle")
            .attr("id", "slr-slider-sel-circ-fore")
            .attr("class", "slr-slider-sel-circ")
            .attr("cx", "50%")
            .attr("cy", y)
            .attr("r", radius-2)
            .attr("fill", this.colors.slideWave)
            .attr("clip-path", "url(#slr-slider-wave-clipmask)")
            .style("-webkit-clip-path", "url(#slr-slider-wave-clipmask)");
        
        var textX = 0.5*sbbox.width + 2;  // slight offset to ignore inches notation in centering
//        this.gSlide.append("text")
//            .attr("id", "slr-slider-sel-text-back")
//            .attr("class", "slr-slider-sel-text")
//            .attr("x", textX)
//            .attr("y", this.scale(this._value) + 7)
//            .attr("text-anchor", "middle")
//            .attr("fill", this.colors.slideTextA)
//            .text(this._value + "\"");
        this.gSlide.append("text")
            .attr("id", "slr-slider-sel-text-fore")
            .attr("class", "slr-slider-sel-text")
            .attr("x", textX)
            .attr("y", this.scale(this._value) + 7)
            .attr("text-anchor", "middle")
            .attr("fill", this.colors.slideTextB)
//            .attr("clip-path", "url(#slr-slider-wave-clipmask)")
            .text(this._value + "\"");
        
        var animateWave = function() {
            wave.transition()
                .duration(period)
                .ease(d3.easeLinear)
                .attr('transform', 'translate(-' + wavelength*1.25 + ',0)')
                .on('end', function() {
                    wave.attr('transform', 'translate(0,0)');
                    animateWave();
                });
        };
        animateWave();
        
        /*
        this.$popup = $(this.elements.slidePopup.createElement("div"))
                          .appendTo(this.elements.container.asJQuery())
                          .css({'left': sbbox.width + 14});
                          */
        //this._updateSlidePopup(y);
    };
    
    
    //********************************************************************************************************
    // Redraw functions (or related). Should be called on resize.
    //********************************************************************************************************
    SLRSlider.prototype._recalculateScale = function(height) {
        if(!height) {
            height = this.gBar.select("#slr-slider-bar").node().getBBox().height;
        }
        this.scale.range([height-this.margins.bottom, this.margins.top]);
    };
    
    SLRSlider.prototype._redrawLabel = function() {
        var sbbox      = this.gBar.select("#slr-slider-bar").node().getBBox(),
            yIncrement = this.margins.bottom / 5.5,
            y          = sbbox.height - this.margins.bottom + 40;
        this.gLabel.selectAll(".slr-slider-label").remove();
    };
    
    SLRSlider.prototype._redrawSliderTicks = function() {
        var self   = this, 
            sbbox  = this.gBar.select("#slr-slider-bar").node().getBBox(), 
            tstart = sbbox.width, 
            tend   = tstart - this.tickLength;
        
        this.gTicks.selectAll(".slr-slider-tick")
            .attr("d", function(d) {
                return (
                    "M" + tstart + " " + self.scale(d) +
                    "H" + tend
                );
            });
        this.gTicks.selectAll(".slr-slider-tick-label, .slr-slider-tick-label-over")
            .attr("y", function(d) { return self.scale(d) + 6; });
    };
    
    SLRSlider.prototype._redrawSliderPosition = function(y) {
        if(!y && y !== 0) { y = this.scale(this._value); }
        this.defs.select("#slr-slider-tick-label-clipmask rect")
            .attr("y", y);
        return y;
    };
    
    SLRSlider.prototype._forceRedrawBar = function() {
        var y = this.scale(this._value);
        this.defs.select("#slr-slider-tick-label-clipmask rect")
            .attr("y", 0)
            .attr("y", y)
            .attr("height", "100%");
    };
    
    
    //********************************************************************************************************
    // Animate function
    //********************************************************************************************************
    SLRSlider.prototype.animateIntro = function(startInches, animationMs) {
        // this disables other interactions until animation is finished
        this._isAnimating = true;
        // start some distance up
        startInches = startInches || this._value;
        animationMs = animationMs || 800;
        var self = this, 
            runningMs = 0, 
            intervalMs = 10;
        var animateFunction = function() {
            runningMs += intervalMs;
            var progress = runningMs / animationMs, 
                eased = d3.easeSinInOut(progress), 
                newY = self.scale(startInches*(1.0-eased));
            self._moveSlide(newY);
            if(eased < 1.0) {
                setTimeout(animateFunction, intervalMs);
            } else {
                console.debug("slider animation ended");
                self._isAnimating = false;
            }
        };
        
        console.debug("slider animation started");
        setTimeout(animateFunction, intervalMs);
    };
    
    
    //********************************************************************************************************
    // Move functions, called on moving slider.
    //********************************************************************************************************
    SLRSlider.prototype._moveSlide = function(y) {
        if(!y && y !== 0) { y = this.scale(this._value); }
        this.defs.select("#slr-slider-wave-clipmask")
            .attr("transform", "translate(0,"+y+")");
        this.gSlide.selectAll(".slr-slider-sel-circ")
            .attr("cy", y);
        this.gSlide.selectAll(".slr-slider-sel-text")
            .attr("y", y + 7);
        this.defs.select("#slr-slider-tick-label-clipmask rect")
            .attr("y", y);
        this._updateSlide(y);
        return y;
    };
    
    SLRSlider.prototype._updateSlide = function(y) {
        if(!y && y !== 0) { y = this.scale(this._value); }
        this._value = Math.round(this.scale.invert(y));
        this.gSlide.selectAll(".slr-slider-sel-text")
            .text(this._value + "\"");
        //this._updateSlidePopup(y);
        return y;
    };
    
    SLRSlider.prototype.getNearestTickAndDistance = function(value) {
        if(!value && value !== 0) { value = this._value; }
        var nearest = null, 
            distance = 0;
        for(var i = 0; i < this.ticks.length; i++) {
            var dist = Math.abs(this.ticks[i] - value);
            if((!nearest && nearest !== 0) || dist <= distance) {
                nearest = this.ticks[i];
                distance = dist;
            }
        }
        return [nearest, distance];
    };
    
    SLRSlider.prototype.grabSlide = function() {
        if(!browserType.isIE) {
            var cl = this.gSlide.node().classList;
            cl.remove("grab");
            cl.add("grabbing");
        } else {
            $(this.gSlide.node()).removeClass("grab").addClass("grabbing");
        }
        this._grabbingSlide = true;
        this.gSlide.selectAll(".slr-slider-sel-text").text("");
        this._disableSlidePopup();
    };
    
    SLRSlider.prototype._moveSlideEvent = function(evt) {
        if(!this._grabbingSlide) return;
        var clientY     = evt.clientY || evt.changedTouches[0].clientY || 0, 
            y           = clientY - document.getElementById("slr-slider-svg").getBoundingClientRect().top, 
            value       = Math.round(this.scale.invert(y));
        if(value < 0) {
            value = 0; 
            y = this.scale(value);
        } else if(value > this.totalInches) {
            value = this.totalInches;
            y = this.scale(value);
        } else {
            var nearestTick = this.getNearestTickAndDistance(value);
            if(nearestTick[1] < 5) {
                value = nearestTick[0];
                y = this.scale(value);
            }
        }
        this._moveSlide(y);
    };
    
    SLRSlider.prototype.ungrabSlide = function(showPopup) {
        if(!this._grabbingSlide) return;
        if(!browserType.isIE) {
            var cl = this.gSlide.node().classList;
            cl.remove("grabbing");
            cl.add("grab");
        } else {
            $(this.gSlide.node()).removeClass("grabbing").addClass("grab");
        }
        this._grabbingSlide = false;
        var y           = this.gSlide.select("#slr-slider-sel-circ-fore").attr("cy"), 
            value       = Math.round(this.scale.invert(y)), 
            nearestTick = this.getNearestTickAndDistance(value);
        y = this.scale(nearestTick[0]);
        this._moveSlide(y);
        this._updateSlide(y);
        //this._enableSlidePopup();
        if(showPopup && this._mouseOver) {
            //this.$popup.show();
        }
        if(this.eventHandlers.sliderChangeListener) {
            this.eventHandlers.sliderChangeListener(this._value);
        }
    };
    
    SLRSlider.prototype.moveSlideToValue = function(value, suppressEventListener) {
        if(this._grabbingSlide || value === this._value) return;
        var nearestTick = this.getNearestTickAndDistance(value);
        this._moveSlide(this.scale(nearestTick[0]));
        if(!suppressEventListener && this.eventHandlers.sliderChangeListener) {
            this.eventHandlers.sliderChangeListener(this._value);
        }
    };
    
    SLRSlider.prototype.moveSlideToClientY = function(clientY, suppressEventListener) {
        if(this._grabbingSlide) return;
        var y           = clientY - document.getElementById("slr-slider-svg").getBoundingClientRect().top, 
            nearestTick = this.getNearestTickAndDistance(Math.round(this.scale.invert(y))), 
            value = nearestTick[0];
        if(value === this._value) return;
        this._moveSlide(this.scale(value));
        if(!suppressEventListener && this.eventHandlers.sliderChangeListener) {
            this.eventHandlers.sliderChangeListener(this._value);
        }
    };
    
    
    //********************************************************************************************************
    // Slide interaction handling
    //********************************************************************************************************
    SLRSlider.prototype._addSlideInteractions = function() {
        if(!window.browserType.isIE) {
            this.gSlide.node().classList.add("grab");
        } else {
            $(this.gSlide.node()).addClass("grab");
        }
        this.svg.style("cursor", "pointer").on('click', this.eventHandlers.svgClickListener);
        this.gSlide.node().addEventListener('mouseover', this.eventHandlers.mouseoverSlideListener);
        this.gSlide.node().addEventListener('touchstart', this.eventHandlers.grabSlideListener);
        this.gSlide.node().addEventListener('mousedown', this.eventHandlers.grabSlideListener);
        document.body.addEventListener('touchmove', this.eventHandlers.moveSlideListener);
        document.body.addEventListener('touchend', this.eventHandlers.ungrabSlideListener);
        window.addEventListener('mousemove', this.eventHandlers.moveSlideListener);
        window.addEventListener('mouseup', this.eventHandlers.ungrabSlideListener);
        this.gSlide.node().addEventListener('mouseout', this.eventHandlers.mouseoutSlideListener);
    };
    
    SLRSlider.prototype._removeSlideInteractions = function() {
        this.svg.on('click', null);
        document.body.removeEventListener('touchmove', this.eventHandlers.moveSlideListener);
        document.body.removeEventListener('touchend', this.eventHandlers.ungrabSlideListener);
        window.removeEventListener('mousemove', this.eventHandlers.moveSlideListener);
        window.removeEventListener('mouseup', this.eventHandlers.ungrabSlideListener);
    };
    
    SLRSlider.prototype.onSliderChange = function(callback) {
        this.eventHandlers.sliderChangeListener = callback;
    };
    
    
    //********************************************************************************************************
    // Slide interaction handling
    //********************************************************************************************************
    SLRSlider.prototype._updateSlidePopup = function(y) {
        if(!y && y !== 0) { y = this.scale(this._value); }
        if(this._value) {
            this.$popup.html("<strong>MHHW <span style='font-size:1.4em;'>+ " + this._value + "\"</span></strong> ");
        } else {
        }
        if(this.popupText && (this._value in this.popupText)) {
            this.$popup.append(this.popupText[this._value]);
        } else {
            this.$popup.append(this.defaultPopupText);
        }
        this.$popup.css('top', y - 0.5*this.$popup.outerHeight());
    };
    
    SLRSlider.prototype._disableSlidePopup = function() {
        this._popupEnabled = false;
    };
    
    SLRSlider.prototype._enableSlidePopup = function() {
        this._popupEnabled = true;
    };
    
    return SLRSlider;
    
});
