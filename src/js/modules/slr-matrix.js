define([
    "jquery", 
    "matrix"
], function(
    jQuery, 
    Matrix
) {
    
    function SLRMatrix(slrLevels, slrLevelsFull) {
        this.slrLevels        = slrLevels;
        this.slrLevelsFull    = slrLevelsFull;
        this.inundationMatrix = null;
        this.matrixExceptions = null;
        this.matrixForcings   = null;
        this.counties         = null;
    }
    
    SLRMatrix.prototype.init = function(onComplete) {
        var self = this;
        $.ajax({
            url: "data/storm-surge.json", 
            dataType: "json", 
            success: function(json) {
                self.__createInundationMatrix(json);
            }, 
            error: function(jqXHR, textStatus, errorThrown) {
                self.error("Data Error", "There was an error loading the the data matrix");
                console.log(textStatus + ": " + errorThrown);
            }, 
            complete: function() {
                if(onComplete) onComplete();
                onComplete = null;
            }
        });
    };
    
    SLRMatrix.prototype.__createInundationMatrix = function(inputData) {
        this.inundationMatrix = {};
        this.matrixExceptions = {};
        this.matrixForcings   = {};
        this.counties = [];
        for(var county in inputData) {
            this.counties.push(county);
            var countyLower = county.toLowerCase(), 
                exceptions = this.matrixExceptions[countyLower] = {},
                forcings = this.matrixForcings[countyLower] = {};
            // lowercase county for matrix key, create 2D matrix
            var keyCount = Object.keys(inputData[county]).reduce(
                                 // count numeric values only (the storm surge levels)
                                 function(a, k) { return !isNaN(k) ? a+1 : a; },
                                 1 // initial value of one for manually added 0-storm-surge
                             ), 
                matrixDims = [this.slrLevelsFull.length, keyCount], 
                theMatrix = this.inundationMatrix[countyLower] = new Matrix(matrixDims);
            theMatrix.setDimensionValue(1, 0, 0);
            // loop by SLR
            for(var i = 0; i < this.slrLevelsFull.length; ++i) {
                // add 0-storm-surge value manually
                theMatrix.setValue([i, 0], this.slrLevelsFull[i]);
                // loop by storm surges
                var j = 0;
                for(var yearly in inputData[county]) {
                    if(isNaN(yearly)) {
                        if(yearly === "exceptions") {
                            // exceptions for inundation search tolerance
                            for(var slr in inputData[county][yearly]) {
                                exceptions[parseInt(slr)] = inputData[county][yearly][slr];
                            }
                        } else if(yearly === "force") {
                            // additional forcings
                            for(var slr in inputData[county][yearly]) {
                                forcings[parseInt(slr)] = inputData[county][yearly][slr];
                            }
                        }
                        continue;
                    }
                    // for first iteration, set storm surge yearly values as 2nd dimension keys
                    if(!i) theMatrix.setDimensionValue(1, 1+j, parseInt(yearly));
                    // add inundation value to matrix
                    theMatrix.setValue(
                        [i, 1+j++], // note, adjust +1 cause we insert 0-level manually
                        this.slrLevelsFull[i] + inputData[county][yearly]
                    );
                }
            }
        }
        inputData = null;
    };
    
    SLRMatrix.prototype.getStormSurgeLevels = function(county) {
        if(!this.inundationMatrix) return null;
        county = county ? county.toLowerCase() : "regional";
        if(!(county in this.inundationMatrix)) county = "regional";
        
        return this.inundationMatrix[county].getDimensionValues(1);
    };
    
    SLRMatrix.prototype.getInundationScenarios = function(county, inundation) {
        if(!this.inundationMatrix) return null;
        county = county ? county.toLowerCase() : "regional";
        if(!(county in this.inundationMatrix)) county = "regional";
        /*
         * Logic is somewhat convoluted, but instead of having to fix the 'color-coding' of which scenarios 
         * match what, I teased out the various rules. Basically one match per SLR, one match per storm surge.
         * Look for lowest SLR match first, with range of -2 to +3. The real problematic kicker is if the 
         * total flooding matches (via the same rules) the next lower or higher indunation level selection. In
         * which case pick the one which is closest.
         */
        var scenarios = [], 
            theMatrix = this.inundationMatrix[county], 
            stormSurgeYearlys = theMatrix.getDimensionValues(1), 
            exceptions = this.matrixExceptions[county][inundation] || {}, 
            // get neighboring storm surge levels
            slrLevelIndex = this.slrLevels.indexOf(inundation), 
            prevSlrLevel = slrLevelIndex > 0 ? this.slrLevels[slrLevelIndex-1] : -9999, 
            nextSlrLevel = ++slrLevelIndex < this.slrLevels.length ? this.slrLevels[slrLevelIndex] : 9999, 
            // optimize so we don't go through lower SLR selections we've already parsed
            lastSlrFoundIndex = 0;
        // default range search is -2 to +3 but check exceptions
        var exceptions = this.matrixExceptions[county], 
            forcings   = this.matrixForcings[county][inundation], 
            lowerLimit = -2, 
            upperLimit = 3;
        if(exceptions && exceptions[inundation]) {
            lowerLimit = exceptions[inundation][0];
            upperLimit = exceptions[inundation][1];
        }
        // go backwards cause as a general rule prefer higher storm surges (with tons of exceptions)
        for(var j = stormSurgeYearlys.length-1; j >= 0; --j) {
            // check if matches a forcing value
            var force = null;
            if(forcings) {
                for(var k = 0; k < forcings.length; ++k) {
                    if(stormSurgeYearlys[j] === forcings[k][0]) {
                        force = forcings[k];
                        break;
                    }
                }
            }
            for(var i = lastSlrFoundIndex; i < this.slrLevelsFull.length; ++i) {
                var level = theMatrix.getValue([i, j]),
                    diff  = 0;
                if(force && this.slrLevelsFull[i] === force[1]) {
                    // skip if forcing dont-add
                    if(!force[2]) continue;
                    // otherwise leaves diff at 0, ensuring an add
                } else {
                    // otherwise calculate diff
                    diff = level - inundation;
                }
                if(diff >= lowerLimit) {
                    if(diff) {
                        if(diff > upperLimit) break;
                        // overlaps with neighboring inundation levels that are closer
                        if(diff < 0 && diff <= prevSlrLevel - level) continue;
                        if(diff > 0 && diff > nextSlrLevel - level) continue;
                    }
                    // finally add scenario
                    scenarios.push({
                        county: county, 
                        slr: this.slrLevelsFull[i], 
                        stormSurge: stormSurgeYearlys[j], 
                        inundation: level
                    });
                    lastSlrFoundIndex = i+1;
                    break;
                }
            }
        }
        // reorder by slr
        //scenarios.sort(function(a, b) { return a.slr > b.slr; });
        return scenarios;
    };
    
    SLRMatrix.prototype.getAllScenarios = function(county) {
        if(!this.inundationMatrix) return null;
        county = county ? county.toLowerCase() : "regional";
        if(!(county in this.inundationMatrix)) county = "regional";
        var scenariosBySlr = {};
        for(var i = 0; i < this.slrLevelsFull.length; ++i) {
            scenariosBySlr[this.slrLevelsFull[i]] = {};
        }
        for(var i = 0; i < this.slrLevels.length; ++i) {
            var scenarios = this.getInundationScenarios(county, this.slrLevels[i]);
            for(var j = 0; j < scenarios.length; ++j) {
                scenariosBySlr[scenarios[j].slr][scenarios[j].stormSurge] = scenarios[j].inundation;
            }
        }
        return scenariosBySlr;
    };
    
    return SLRMatrix;
    
});