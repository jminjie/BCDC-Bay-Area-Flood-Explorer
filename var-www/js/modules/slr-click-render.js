define([], function() {
    return function(featsInfo) {
        var slrValue = this.state.get("slrvalue"), 
            html = [], 
            indexFlooding = -1, 
            indexOvertopping = -1, 
            consqData = {}, 
            focusArea = null, 
            clickEcc = false, 
            oceanHash = -1;  // if in ocean/delta region which is hashed out
        for(var i = 0; i < featsInfo.length; ++i) {
            switch(featsInfo[i]._layer) {
                case this.clickLayers["oceanhash"]:
                    oceanHash = parseInt(featsInfo[i]["Id"]);
                    break;
                case this.clickLayers["ecchash"]:
                    clickEcc = true;
                    break;
                case this.clickLayers["focusareas"]:
                    focusArea = featsInfo[i];
                    break;
                case this.clickLayers["inundation"]:
                case this.clickLayers["inundation2"]:
                    if(indexFlooding < 0) {
                        var inches = parseInt(featsInfo[i]["value_0"]), 
                            feet = inches/12.0;
                        indexFlooding = html.length;
                        html.push(
                            "<h2>Depth of Flooding</h2>" + 
                            "<strong>Depth:</strong> " + feet.addCommas(2) + " feet<br />" + 
                            "<a href='/about/a-limitations' target='_blank'>Why do the maps show flooding here?</a>" + 
                            "<div class='popup-spacer'></div>"
                        );
                    }
                    break;
                case this.clickLayers["overtopping"]:
                    var heightFt = parseFloat(featsInfo[i]["ot_ft"]) || 0;
                        //feet = Math.floor(heightFt), 
                        //inches = (heightFt - feet)*12.0;
                    indexOvertopping = html.length;
                    html.push(
                        "<h2>Shoreline Overtopping</h2>" + 
                        "<strong>Overtopping Depth</strong>: " + heightFt.addCommas(2) + " feet<br />" + 
                        "<strong>Shoreline Type</strong>: <a class='shoreline-glossary-link'>" + featsInfo[i]["class"] + "</a>" + 
                        "<div class='popup-spacer'></div>"
                    );
                    break;
                case this.clickLayers["consq-hwy-vehicle"]:
                    if(!consqData.highways) consqData.highways = {};
                    consqData.highways.vehicle = featsInfo[i];
                    break;
                case this.clickLayers["consq-hwy-truck"]:
                    if(!consqData.highways) consqData.highways = {};
                    consqData.highways.truck = featsInfo[i];
                    break;
                case this.clickLayers["consq-rail"]:
                    if(!consqData.rail) consqData.rail = {};
                    if("station_na" in featsInfo[i]) {
                        consqData.rail.station = featsInfo[i];
                    } else {
                        consqData.rail.line = featsInfo[i];
                    }
                    break;
                case this.clickLayers["consq-recreation"]:
                    var col = "twl" + slrValue + "_sum";
                    if(col in featsInfo[i]) {
                        consqData.recreation = {
                            val: parseFloat(featsInfo[i][col]), 
                            name: featsInfo[i].name
                        };
                    }
                    break;
                case this.clickLayers["consq-tidalhabitat"]:
                    var col = "twl" + slrValue + "_acres";
                    if(col in featsInfo[i]) {
                        consqData.tidalHabitat = {
                            val: parseFloat(featsInfo[i][col]), 
                            name: featsInfo[i].name
                        };
                    }
                    break;
                case this.clickLayers["consq-housing"]:
                    var col = "twl" + slrValue + "_res_units_2010";
                    if(col in featsInfo[i]) {
                        consqData.housing = {
                            val: parseFloat(featsInfo[i][col]), 
                            name: featsInfo[i].name
                        };
                    }
                    break;
                case this.clickLayers["consq-jobs"]:
                    var col = "twl" + slrValue + "_job_spaces_2010";
                    if(col in featsInfo[i]) {
                        consqData.jobs = {
                            val: parseFloat(featsInfo[i][col]), 
                            name: featsInfo[i].name
                        };
                    }
                    break;
                case this.clickLayers["consq-vulcom-social"]:
                    if(!consqData.vulcom) consqData.vulcom = {};
                    consqData.vulcom.social = {
                        resUnits: parseFloat(featsInfo[i]["sum_res_units_2010"]), 
                        rank: featsInfo[i]["socvlnrank"], 
                        oluname: featsInfo[i]["oluname"]
                    };
                    break;
                case this.clickLayers["consq-vulcom-contam"]:
                    if(!consqData.vulcom) consqData.vulcom = {};
                    consqData.vulcom.contamination = {
                        resUnits: parseFloat(featsInfo[i]["sum_res_units_2010"]), 
                        rank: featsInfo[i]["contamrank"], 
                        oluname: featsInfo[i]["oluname"]
                    };
                    break;
            }
        }
        // if overtopping and inundation, only show overtopping
        if(html.length && ~indexOvertopping && ~indexFlooding) html.splice(indexFlooding, 1);
        // consequence data grouped and html created here
        if(Object.keys(consqData).length) {
            var consqHtml = ["<h2>Consequence</h2>"];
            if(consqData.highways) {
                var section = "", 
                    rte = false;
                if(consqData.highways.vehicle) {
                    if(!rte) {
                        section += (
                            "<strong>Highway/Interstate Impacts</strong><br />" 
                            + "Route " + consqData.highways.vehicle["route"] + "<br />"
                        );
                        var miles = 0.000621371*parseFloat(consqData.highways.vehicle["r_length_m"]);
                        section += miles.addCommas(1) + " Miles<br />";
                        if(parseInt(consqData.highways.vehicle["lifeline_rt"])) {
                            section += "<a class='glossary-link' value='highways-lifeline'>Lifeline Route</a><br />";
                        }
                        rte = true;
                    }
                    var aadt = parseFloat(consqData.highways.vehicle["veh_aadt_num_av"]);
                    section += aadt.addCommas(0) + " <a class='glossary-link' value='highways-vehicles'>Vehicles (AADT)</a><br />";
                }
                if(consqData.highways.truck) {
                    if(!rte) {
                        section += (
                            "<strong>Highway/Interstate Impacts</strong><br />" 
                            + "Route " + consqData.highways.truck["route"] + "<br />"
                        );
                        var miles = 0.000621371*parseFloat(consqData.highways.truck["r_length_m"]);
                        section += miles.addCommas(1) + " miles<br />";
                        if(parseInt(consqData.highways.truck["lifeline_rt"])) {
                            section += "<a class='glossary-link' value='highways-lifeline'>Lifeline Route</a><br />";
                        }
                        rte = true;
                    }
                    var aadt = parseFloat(consqData.highways.truck["truckaadt_num_av"]);
                    section += aadt.addCommas(0) + " <a class='glossary-link' value='highways-trucks'>Trucks (AADTT)</a><br />";
                }
                consqHtml.push(section);
            }
            if(consqData.rail) {
                if(consqData.rail.line) {
                    consqHtml.push(
                        "<strong>Rail Line Impacts</strong><br />" + 
                        consqData.rail.line["operator"] + "<br />"
                    );
                    var ridership = parseFloat(consqData.rail.line["ridership"]);
                    consqHtml.push(
                        ridership.addCommas(0) + " <a class='glossary-link' value='commuter-rail-lines'>Daily Average Passengers</a><br />"
                    );
                }
                if(consqData.rail.station) {
                    consqHtml.push(
                        "<strong>Rail Station Impacts</strong><br />" + 
                        consqData.rail.station["agencyname"] + " - " + consqData.rail.station["station_na"] + "<br />"
                    );
                    var ridership = parseFloat(consqData.rail.station["total_ride"]);
                    consqHtml.push(
                        ridership.addCommas(0) + " <a class='glossary-link' value='commuter-rail-stations'>Daily Average Passengers</a><br />"
                    );
                }
            }
            if(consqData.recreation) {
                consqHtml.push(
                    "<strong>Vistation Impacts</strong><br />" + 
                    consqData.recreation.val.addCommas(1) + " <a class='glossary-link' value='photo-user-days'>Photo User Days</a><br />"
                );
            }
            if(consqData.tidalHabitat) {
                consqHtml.push(
                    "<strong>Tidal Marsh Impacts</strong><br />" + 
                    consqData.tidalHabitat.val.addCommas(0) + " Acres<br />"
                );
            }
            if(consqData.housing) {
                consqHtml.push(
                    "<strong>Housing Impacts</strong><br />" + 
                    consqData.housing.val.addCommas(0) + " Residential Units (2010)<br />"
                );
            }
            if(consqData.jobs) {
                consqHtml.push(
                    "<strong>Jobs Impacts</strong><br />" + 
                    consqData.jobs.val.addCommas(0) + " Job Spaces (2010)<br />"
                );
            }
            if(consqData.vulcom) {
                if(consqData.vulcom.social) {
                    consqHtml.push(
                        "<strong>Socially Vulnerable Housing Impacts</strong><br />" + 
                        consqData.vulcom.social.resUnits.addCommas(0) + 
                        " <a class='glossary-link' value='vulcom-social-res'> Residential Units (2010)</a><br />"
                    );
                }
                if(consqData.vulcom.contamination) {
                    consqHtml.push(
                        "<strong>Contamination Vulnerable Housing Impacts</strong><br />" + 
                        consqData.vulcom.contamination.resUnits.addCommas(0) + 
                        " <a class='glossary-link' value='vulcom-contam-res'> Residential Units (2010)</a><br />"
                    );
                }
            }
            // spacer, focus area, methodology link, another space
            if(focusArea) {
                consqHtml.push("<div class='popup-spacer'></div>");
                consqHtml.push(
                    "<a href='" + focusArea["url"] + "' target='_blank' rel='noopener'>" + 
                        "Learn about local sea level rise vulnerability.</a>"
                );
            }
            consqHtml.push(
                "<div class='popup-spacer'></div>" + 
                "<a href='http://www.adaptingtorisingtides.org/wp-content/uploads/2020/03/ARTBayArea_Appendix_Final_March2020_ADA.pdf' " + 
                    "target='blank' rel='noopener'>How is consequence measured?</a>"
            );
            consqHtml.push("<div class='popup-spacer'></div>");
            // consequence html goes first
            html = consqHtml.concat(html);
        }
        // no data
        if(!html.length && oceanHash < 0 && !clickEcc) return null;
        // final part
        if(clickEcc) {
            html.unshift("<p>The dynamics within the Delta must be modeled differently that the rest of the Bay due to the increased influence of freshwater inflows. Click to explore sea level rise and storm event flooding in East Contra Costa county. <a href='https://eccexplorer.adaptingtorisingtides.org' target='_blank'>East Contra Costa Shoreline Flood Explorer</a></p>");
        } else {
            if(oceanHash === 0) {
                // ID=0 is ocean
                html.unshift("<p>The open coast is modeled differently than the Bay and thus not included in these maps. See <a href='/faq/a-outside' target='_blank'>FAQ section</a> for suggested resources.</p>");
            } else if(oceanHash > 0) {
                // ID=1 is delta
                html.unshift("<p>The dynamics within the delta must be modeled differently than the rest of the Bay and are not currently captured in these maps. See <a href='/faq/a-outside' target='_blank'>FAQ section</a> for suggested resources.</p>");
            }
            html.push("<h2>Get Involved</h2><a href='" + this.getInvolvedUrl + "' target='_blank'>Adapation Around the Region</a>");
        }
        return html.join("");
    };
});